# CRS unified image: nginx (SPA + reverse proxy) + Node API
# Render Web Service: expose $PORT via nginx; API listens on API_INTERNAL_PORT (5000).

FROM node:22-alpine AS client-build
WORKDIR /app/client
COPY client/package.json client/package-lock.json ./
RUN npm ci
COPY client/ ./
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}
RUN npx vite build

FROM node:22-alpine AS server-deps
WORKDIR /app/server
COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev

FROM node:22-alpine AS server-build
WORKDIR /app/server
COPY server/package.json server/package-lock.json ./
RUN npm ci
COPY server/tsconfig.json ./
COPY server/src ./src
RUN npx tsc --noEmitOnError false; test -f dist/server.js

FROM node:22-alpine AS runner
RUN apk add --no-cache nginx gettext tini wget \
  && mkdir -p /var/uploads /run/nginx /usr/share/nginx/html /etc/nginx/templates \
  && rm -f /etc/nginx/http.d/default.conf

WORKDIR /app/server

ENV NODE_ENV=production
ENV API_INTERNAL_PORT=5000

COPY --from=server-deps /app/server/node_modules ./node_modules
COPY --from=server-build /app/server/dist ./dist
COPY --from=server-build /app/server/package.json ./

COPY --from=client-build /app/client/dist /usr/share/nginx/html

COPY docker/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 10000

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT:-10000}/api/v1/health/live" || exit 1

ENTRYPOINT ["/sbin/tini", "--", "/entrypoint.sh"]
