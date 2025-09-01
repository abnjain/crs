import express from "express";
import auth from "../middlewares/auth.js";
import role from "../middlewares/role.js";
import * as ctrl from "../controllers/assessmentsController.js";
const router = express.Router();

router.post("/exams", auth, role(["Teacher","Admin","SuperAdmin"]), ctrl.createExam);
router.get("/exams", auth, ctrl.listExams);
router.post("/marks", auth, role(["Teacher", "Admin", "SuperAdmin"]), ctrl.bulkMarks);
router.get("/marks", auth, ctrl.queryMarks);
router.get("/gradesheet/:studentId/:term", auth, ctrl.gradesheet);

export default router;
