import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });  // Load .env from root

export const config = {
    jwt: {
        secret: process.env.JWT_SECRET || 'default-secret',  // Fallback for dev
        refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
        accessExpiry: process.env.JWT_ACCESS_EXPIRY || '1h',
        refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d'
    },
    db: {
        uri: process.env.MONGO_URI || 'mongodb://localhost:27017/crs' || 'mongodb+srv://connection_string/<DB_NAME>'
    },
    server: {
        port: process.env.BACKEND_PORT || 3000,
        env: process.env.NODE_ENV || 'development',
        frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5000' || 'hostedurl',
        debug: process.env.DEBUG || false,
    },
    logs: {
        logLevel: process.env.LOG_LEVEL || 'info',
        logFile: process.env.LOG_FILE || 'app.log'
    },
    session: {
        secret: process.env.SESSION_SECRET || 'default-secret'
    },
    redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379'
    },
    mail: {
        smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
        smtpPort: process.env.SMTP_PORT || 587,
        smtpUser: process.env.SMTP_USER || 'your-email@gmail.com',
        smtpPass: process.env.SMTP_PASS || 'your-email-password',
        smtpFrom: process.env.SMTP_FROM || 'your-email@gmail.com'
    },
    appwrite: {
        endpoint: process.env.APPWRITE_ENDPOINT || 'http://localhost/api/v1',
        projectId: process.env.APPWRITE_PROJECT_ID || 'your-project-id',
        apiKey: process.env.APPWRITE_API_KEY || 'your-api-key'
    }
};