import express from "express";
const router = express.Router();
import auth from "../middlewares/auth.js";
import role  from "../middlewares/role.js";
import { createStudent, getMyProfile,updateStudent, listStudents, getIdCard, generateIdCard } from "../controllers/studentController.js";

router.post("/", auth, role(["Admin","SuperAdmin"]), createStudent);
router.get("/me", auth, role(["Student"]), getMyProfile);
router.patch("/:enrollmentNo", auth, role(["Student","Admin","SuperAdmin"]), updateStudent);
router.get("/", auth, role(["Admin","SuperAdmin"]), listStudents);
router.get("/:enrollmentNo/idcard", auth, role(["Student","Admin","SuperAdmin"]), getIdCard);
router.post("/:enrollmentNo/idcard", auth, role(["Admin","SuperAdmin"]), generateIdCard);

export default router;
