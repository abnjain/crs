import express from "express";
import auth from "../middlewares/auth.js";
import role from "../middlewares/role.js";
import * as ctrl from "../controllers/analyticsController.js";

const router = express.Router();

router.get("/overview", auth, role(["Admin","SuperAdmin"]), ctrl.overview);
router.get("/performance", auth, role(["Teacher","Admin","SuperAdmin"]), ctrl.performance);
router.get("/library", auth, role(["Admin","SuperAdmin"]), ctrl.libraryAnalytics);

export default router;
