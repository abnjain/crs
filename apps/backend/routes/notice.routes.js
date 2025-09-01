import express from "express";
const router = express.Router();
import auth from "../middlewares/auth.js";
import role  from "../middlewares/role.js";
import { createNotice, getNotices } from "../controllers/noticeController.js";

router.post("/", auth, role(["Admin","Staff","SuperAdmin"]), createNotice);
router.get("/", auth, getNotices);

// messaging (optional) - simple placeholder
router.post("/messages", auth, (req, res) => res.json({ ok: true, msg: "message sent (placeholder)" }));
router.get("/messages/thread/:userId", auth, (req, res) => res.json({ ok: true, threadWith: req.params.userId }));

export default router;
