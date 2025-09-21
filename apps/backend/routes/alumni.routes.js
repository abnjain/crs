// apps/backend/routes/alumni.routes.js
import express from "express";
import multer from "multer";
import * as ctrl from "../controllers/alumniController.js";
import auth from "../middlewares/auth.js";
import role from "../middlewares/role.js";

const router = express.Router();
const upload = multer(); // memory storage (buffer)

router.post("/", auth, role(["Admin","SuperAdmin","Staff","Teacher"]), ctrl.createAlumnus);
router.get("/", auth, ctrl.listAlumni);
router.get("/:id", auth, ctrl.getAlumnus);
router.patch("/:id", auth, role(["Admin","SuperAdmin","Staff","Teacher"]), ctrl.updateAlumnus);
router.delete("/:id", auth, role(["Admin","SuperAdmin","Staff","Teacher"]), ctrl.deleteAlumnus);

// Message selected alumni (faculty)
router.post("/message", auth, role(["Teacher","Admin","SuperAdmin","Staff"]), ctrl.messageAlumni);

// Bulk excel upload
router.post("/upload/excel", auth, role(["Teacher","Admin","SuperAdmin","Staff"]), upload.single("file"), ctrl.uploadAlumniExcel);

export default router;
