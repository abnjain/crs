// Packages imported
import express from "express";
import { config } from "./config/config.js";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import session from "express-session";
import { RedisStore } from "connect-redis";
import Redis from "ioredis";
import dbgr from "debug"

// Files imported

// Routes imported
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import studentRoutes from "./routes/student.routes.js";
import teacherRoutes from "./routes/teacher.routes.js";
import placementsRoutes from "./routes/placements.routes.js";
import docsRoutes from "./routes/docs.routes.js";
import assesmentRoutes from "./routes/assessments.routes.js";
import analytics from "./routes/analytics.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import libraryRoutes from "./routes/library.routes.js";
import noticeRoutes from "./routes/notice.routes.js";
import alumniRoutes from "./routes/alumni.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import eventsRoutes from "./routes/events.routes.js";
import { revokeToken, verifyJWTAuth } from "./utils/auth.js";


// Packages configuration
const app = express();
const debug = dbgr(config.server.env);

// Package Middlewares
// helmet (to disable X-powered-by)
app.use(helmet());
// for limiting cross origin requests
app.use(cors({
  origin: config.server.frontendUrl,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
}));
// for limiting API requests
// const apiLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 min
//   max: 100, // 100 requests / IP / window
//   message: "Too many requests, please try again later",
// });
// app.use("/api/v1", apiLimiter);
// for reading body message in a request (eg. POST request, and limiting it to 5 mb data)
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded or in other words form data
// for session creation, redis configuration and management
// const redisClient = new Redis(config.redis.url);
// const RedisStores = new RedisStore({ client: redisClient });
// app.use(
//   session({
//     store: RedisStores,
//     secret: config.session.secret,
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       httpOnly: true,
//       secure: config.server.env === "production",
//       sameSite: "strict",
//       maxAge: 1000 * 60 * 60, // 1 hr
//     },
//   })
// );
// for logging request hits in the console or terminal
app.use(morgan("dev"));
// ✅ Token Revocation Middleware
app.use(revokeToken);


// DB connection
import connectDB from "./config/db.js";
connectDB();

// Simple test route
app.get("/", (req, res, next) => {
  try {
    res.status(200).json({ message: "CRS Backend Running 🚀", ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
    next(err);
  }
});

// API Version
const version = "v1"; // version 1

// Routes
app.use(`/api/${version}/auth`, authRoutes);
app.use(`/api/${version}/students`, studentRoutes);
app.use(`/api/${version}/teachers`, teacherRoutes);
app.use(`/api/${version}/admin`, adminRoutes);
app.use(`/api/${version}/library`, libraryRoutes);
app.use(`/api/${version}/placements`, placementsRoutes);
app.use(`/api/${version}/notices`, noticeRoutes);
app.use(`/api/${version}/docs`, docsRoutes);
app.use(`/api/${version}/assesment`, assesmentRoutes);
app.use(`/api/${version}/analytics`, analytics);
app.use(`/api/${version}/alumni`, alumniRoutes);
app.use(`/api/${version}/upload`, uploadRoutes);
app.use(`/api/${version}/events`, eventsRoutes);

// Health Route Middleware
app.use("/api/health", healthRoutes);
app.use(`/api/${version}/health`, healthRoutes);

// Define the catch-all route as the last route
app.all(`{*any}`, (req, res, next) => {
  try {
    res.status(404).json({ message: "The API endpoint you requested does not exist. Please check the documentation for available endpoints.", ok: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error", ok: false });
    next(err);
  }
});

// basic error handler
app.use((err, req, res, next) => {
  try {
    res.status(404).json({ message: "The API endpoint you requested does not exist. Please check the documentation for available endpoints.", ok: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error", ok: false });
    next(err);
  }
  // console.error(err);
  // res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});

const PORT = config.server.port;
app.listen(PORT, () => {
  config.server.env = "development" ? console.log(`Backend running on Server http://localhost:${PORT}`) : console.log(`Backend running on PORT ${PORT}`);
});
