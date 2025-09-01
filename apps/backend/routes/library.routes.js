import express from "express";
import auth from "../middlewares/auth.js";
import allowedRoles from "../middlewares/role.js";
import * as ctrl from "../controllers/libraryController.js";

const router = express.Router();

router.post("/books", auth, allowedRoles(["Librarian","Admin","SuperAdmin"]), ctrl.addBook);
router.get("/books", auth, ctrl.searchBooks);
router.post("/books/:bookId/issue", auth, allowedRoles(["Librarian","Admin","SuperAdmin"]), ctrl.issueBook);
router.post("/books/:bookId/return", auth, allowedRoles(["Librarian","Admin","SuperAdmin"]), ctrl.returnBook);
router.get("/loans", auth, ctrl.loansForStudent);
router.get("/fines", auth, ctrl.finesForStudent);

export default router;
