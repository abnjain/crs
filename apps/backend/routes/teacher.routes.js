import express from "express";
const router = express.Router();
import auth from "../middlewares/auth.js";
import role  from "../middlewares/role.js";
import * as ctrl from "../controllers/teacherController.js";

router.post("/", auth, role(["Teacher","Admin","SuperAdmin"]), ctrl.createTeacher);
router.post("/materials", auth, role(["Teacher","Admin","SuperAdmin"]), ctrl.uploadMaterial);

router.get("/upcoming-classes", auth, role(["Teacher"]), ctrl.getUpcomingClasses);
router.get("/my-subjects", auth, role(["Teacher"]), ctrl.getMySubjects);

export default router;
