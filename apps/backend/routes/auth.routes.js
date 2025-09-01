import express from "express";
const router = express.Router();
import { register, login, requestPasswordReset, resetPassword, logout, sendOtp, verifyOtp } from "../controllers/authController.js";
import { getMe, updateMe, getUserById, updateRoles, listUsers } from "../controllers/userController.js";

// Auth Routes
router.post("/register", register);
router.post("/login", login);
router.post("/reset/request", requestPasswordReset);
router.post("/reset/confirm", resetPassword);
router.post("/logout", logout);
router.post("/otp/send", sendOtp);
router.post("/otp/verify", verifyOtp);

// User profile routes
router.get("/users/me", getMe);
router.patch("/users/me", updateMe);
router.get("/users/:id", getUserById);
router.patch("/users/:id/roles", updateRoles);
router.get("/users", listUsers);

export default router;
