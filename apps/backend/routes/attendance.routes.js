import express from "express";
import auth from "../middlewares/auth.js";
import role from "../middlewares/role.js";
import * as ctrl from "../controllers/attendanceController.js";
const router = express.Router();

router.post("/mark", auth, role(["Teacher"]), ctrl.markAttendance);
router.get("/", auth, ctrl.queryAttendance);
router.get("/summary", auth, role(["Teacher","Admin","SuperAdmin"]), ctrl.summary);

export default router;
