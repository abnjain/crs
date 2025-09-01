import express from "express";
const router = express.Router();
import auth from "../middlewares/auth.js";
import role  from "../middlewares/role.js";
import { createTeacher, uploadMaterial } from "../controllers/teacherController.js";

router.post("/", auth, role(["Teacher","Admin","SuperAdmin"]), createTeacher);
router.post("/materials", auth, role(["Teacher","Admin","SuperAdmin"]), uploadMaterial);

export default router;
