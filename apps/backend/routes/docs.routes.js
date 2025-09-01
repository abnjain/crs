import express from "express";
import auth from "../middlewares/auth.js";
import role from "../middlewares/role.js";
import * as ctrl from "../controllers/docsController.js";
const router = express.Router();

router.post("/", auth, role(["Teacher","Admin","SuperAdmin"]), ctrl.createDoc);
router.get("/", auth, ctrl.listDocs);
router.get("/:docId", auth, ctrl.getDocSignedUrl);
router.post("/:docId/versions", auth, role(["Teacher","Admin","SuperAdmin"]), ctrl.addVersion);
router.patch("/:docId/visibility", auth, role(["Admin","SuperAdmin"]), ctrl.patchVisibility);

export default router;
