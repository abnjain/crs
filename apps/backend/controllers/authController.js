import { User } from "../models/index.js";
import bcrypt from "bcrypt";
import { sign, signRefresh } from "../utils/jwt.js";
import crypto from "crypto";
import sendMail from "../utils/mail.js";
import { config } from "../config/config.js";

export const register = async (req, res) => {
  try {
    if (!req.body) return res.status(400).json({ message: "Valid Input of email, password and phone are required", error: "Invalid Input" });
    const { email, password, name, phone, roles } = req.body;
    if (!email || !password || !phone) return res.status(400).json({ message: "Correct Email/password/phone required", error: "Invalid Input" });
    const exists = await User.findOne({ $or: [{ email }, { phone }] })
    if (exists) return res.status(400).json({ message: "Account already exists", error: "Invalid Input" });
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hash, name, phone, roles: roles || "Student" });
    const token = sign(user);
    const refresh = signRefresh(user);
    console.log({ message: "Registered successfully", user: { email: user.email } });
    return res.status(200).json({ user: { id: user._id, email: user.email, roles: user.roles }, token, refresh, message: "Registered successfully", ok: true });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "Entry Already Exists: Email or Phone already exists", error: err.keyValue });
    }
    return res.status(500).json({ message: "Can't register user or Internal Server Error", error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    if (!req.body) return res.status(400).json({ message: "Valid Input of email and password required", error: "Invalid Input" });
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');;
    if (!user) return res.status(400).json({ message: "Invalid credentials", error: "Invalid Input" });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: "Invalid credentials", error: "Invalid Input" });
    const token = sign(user);
    const refresh = signRefresh(user);
    console.log({ message: "Logged in successfully", user: { email: user.email } });
    return res.status(200).json({ user: { id: user._id, email: user.email, roles: user.roles }, token, refresh, message: "Logged in successfully", ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Login failed or Internal Server Error", error: err.message });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refresh } = req.body;
    if (!refresh) return res.status(401).json({ message: "Refresh token missing" });

    const payload = verifyJWT(refresh, config.jwt.refreshSecret);
    const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ message: "User not found" });

    const token = sign(user);
    return res.status(200).json({ token, ok: true });
  } catch (err) {
    return res.status(401).json({ message: "Invalid refresh token", error: err.message });
  }
}

export const requestPasswordReset = async (req, res) => {
  try {
    if (!req.body) return res.status(400).json({ message: "Valid Input email required", error: "Invalid Input" });
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required", error: "Invalid Input" });
    const user = await User.findOne({ email });
    if (!user) return res.status(200).json({ ok: true, message: "If an account with that email exists, a password reset link will be sent." }); // no need to reveal
    const token = crypto.randomBytes(20).toString("hex");
    user.resetToken = token;
    user.resetTokenExp = Date.now() + 3600 * 1000; // 1h
    await user.save();
    const url = `${config.server.frontendUrl}/reset-password?token=${token}`;
    await sendMail(email, "Password reset", `Reset: ${url}`, `<a href="${url}">Reset</a>`);
    console.log("sent", token, url);
    return res.status(200).json({ ok: true, resetPData: { token, url }, message: "If an account with that email exists, a password reset link will be sent." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Password Request Reset failed or Internal Server Error", error: err.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    if (!req.body) return res.status(400).json({ message: "Valid Input required", error: "Invalid Input" });
    const { token, password } = req.body;
    const user = await User.findOne({ resetToken: token, resetTokenExp: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ message: "Invalid token", error: "Invalid Input" });
    user.password = await bcrypt.hash(password, 10);
    user.resetToken = null;
    user.resetTokenExp = null;
    await user.save();
    console.log({ ok: true, message: "Password reset successfully" });
    return res.status(200).json({ ok: true, message: "Password reset successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Password Reset failed or Internal Server Error", error: err.message });
  }
};

export const logout = async (req, res) => { 
  try {
    console.log("Logging out user", req.user);
    
    const user = await User.findById(req.user.id);
    if (user) {
      user.tokenVersion += 1;  // Invalidate all tokens for this user
      await user.save();
    }
    req.token = null;
    console.log({ ok: true, message: "Logged out" });
    return res.status(200).json({ ok: true, message: "Logged out" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Logout Failed or Internal Server Error", error: err.message });
  }
};

export const sendOtp = async (req, res) => {
  try {
    // Send OTP logic
    console.log({ ok: true, message: "OTP sent" });
    res.status(200).json({ ok: true, message: "OTP sent" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "OTP Generation Failed or Internal Server Error", error: err.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    // Verify OTP logic
    console.log({ ok: true, message: "OTP verified" });
    res.status(200).json({ ok: true, message: "OTP verified" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "OTP Verification Failed or Internal Server Error", error: err.message });
  }
};