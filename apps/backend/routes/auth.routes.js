import express from "express";
const router = express.Router();
import { register, login, requestPasswordReset, resetPassword, logout, sendOtp, verifyOtp, refreshToken } from "../controllers/authController.js";
import { getMe, updateMe, getUserById, updateRoles, listUsers, revokeAllTokens } from "../controllers/userController.js";
import auth from "../middlewares/auth.js";
import role from "../middlewares/role.js";

// Auth Routes
router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshToken);
router.post("/reset/request", requestPasswordReset);
router.post("/reset/confirm", resetPassword);
router.post("/logout", logout);
router.post("/otp/send", sendOtp);
router.post("/otp/verify", verifyOtp);

// User profile routes
router.get("/users/me", auth, getMe);
router.patch("/users/me", auth, updateMe);
router.get("/users/:id", auth, getUserById);
router.patch("/users/:id/roles", auth, updateRoles);
router.get("/users", auth, listUsers);
router.post('/revoke-all', auth, role('admin', 'superadmin'), revokeAllTokens);

export default router;
