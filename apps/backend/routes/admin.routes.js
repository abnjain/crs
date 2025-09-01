import express from "express";
const router = express.Router();
import auth from "../middlewares/auth.js";
import role  from "../middlewares/role.js";
import { createUser, getOverview } from "../controllers/adminController.js";

router.post("/users", auth, role(["Admin","SuperAdmin"]), createUser);
router.get("/overview", auth, role(["Admin","SuperAdmin"]), getOverview);

export default router;
