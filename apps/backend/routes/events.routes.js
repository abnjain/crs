import express from "express";
import auth from "../middlewares/auth.js";
import role from "../middlewares/role.js";
import * as ctrl from "../controllers/eventsController.js";
import multer from "multer";

const upload = multer();
const router = express.Router();

router.post("/", auth, role(["Admin","SuperAdmin","Staff","Teacher"]), upload.array("photos"), ctrl.createEvent);
router.get("/", auth, ctrl.listEvents);
router.get("/:id", auth, ctrl.getEvent);
router.patch("/:id", auth, role(["Admin","SuperAdmin","Staff","Teacher"]), upload.array("photos"), ctrl.updateEvent);
router.delete("/:id", auth, role(["Admin","SuperAdmin","Staff","Teacher"]), ctrl.deleteEvent);

export default router;
