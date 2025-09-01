FROM node:22-alpine AS builder
WORKDIR /app
COPY apps/backend/package*.json ./
RUN npm install --production
COPY apps/backend .
EXPOSE 3000
CMD ["node", "index.js"]
