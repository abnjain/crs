import express from "express";
const router = express.Router();
import { ping } from "../controllers/healthController.js";

router.get("/", ping);

export default router;
