// backend/routes/uploadRoutes.js
import express from "express";
import upload from "../middlewares/upload.js";
import { handleFileUpload } from "../controllers/uploadController.js";

const router = express.Router();

// Single route for all upload systems
router.post("/", upload.single("file"), handleFileUpload);

export default router;
