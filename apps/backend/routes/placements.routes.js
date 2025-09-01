import express from "express";
import auth from "../middlewares/auth.js";
import role from "../middlewares/role.js";
import * as ctrl from "../controllers/placementsController.js";

const router = express.Router();

router.post("/jobs", auth, role(["Admin","SuperAdmin"]), ctrl.createJob);
router.get("/jobs", auth, ctrl.listJobs);
router.post("/jobs/:jobId/apply", auth, role(["Student"]), ctrl.applyJob);
router.get("/applications", auth, ctrl.listApplications);

export default router;
