// Different approaches for different environments
const getConfig = () => {
  // Check if running in browser vs Node.js
  const isBrowser = typeof window !== 'undefined';
  if (isBrowser) {
    // For browser, use Vite env variables
    return {
      api: {
        baseUrl: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000',
        version: import.meta.env.VITE_API_VERSION || '/api/v1'
      },
      auth: {
        tokenKey: 'token',
        refreshTokenKey: 'refreshToken',
        versionCheckEnabled: import.meta.env.VITE_TOKEN_VERSION_CHECK === 'true',
        autoRefreshEnabled: import.meta.env.VITE_AUTO_REFRESH_ENABLED === 'true'
      },
      app: {
        name: import.meta.env.VITE_APP_NAME || 'CRS App'
      },
      server: {
        frontendUrl: import.meta.env.VITE_FRONTEND_URL || `http://localhost:${import.meta.env.VITE_FRONTEND_PORT || 5173}`,
        port: import.meta.env.VITE_FRONTEND_PORT || 5173
      }
    };
  } else {
    // For Node.js/server-side (if needed)
    return {
      api: {
        baseUrl: process.env.BACKEND_URL || 'http://localhost:3000',
        version: process.env.API_VERSION || '/api/v1'
      },
      auth: {
        tokenKey: 'token',
        refreshTokenKey: 'refreshToken',
        versionCheckEnabled: process.env.TOKEN_VERSION_CHECK === 'true',
        autoRefreshEnabled: process.env.AUTO_REFRESH_ENABLED === 'true'
      },
      app: {
        name: process.env.jAPP_NAME || 'CRS App'
      },
      server: {
        frontendUrl: process.env.FRONTEND_URL || `http://localhost:${process.env.FRONTEND_PORT || 5173}`,
        port: process.env.FRONTEND_PORT || 5173
      }
    };
  }
};

export const config = getConfig();
export default config;