import { User } from "../models/index.js";

export const getMe = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) return res.status(401).json({ error: "Unauthorized", message: "User not authenticated" });
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found", error: "Not Found" });
        console.log({ user, ok: true, message: "User fetched successfully" });
        res.status(200).json({ user, ok: true, message: "User fetched successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch user or Internal Server Error", error: err.message });
        next(err);
    }
};

export const updateMe = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) return res.status(401).json({ error: "Unauthorized", message: "User not authenticated" });
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found", error: "Not Found" });
        // Update user logic
        console.log({ ok: true, message: "Profile updated" });
        res.status(200).json({ ok: true, message: "Profile updated" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to update user or Internal Server Error", error: err.message });
        next(err);
    }
};

export const getUserById = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) return res.status(401).json({ error: "Unauthorized", message: "User not authenticated" });
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found", error: "Not Found" });
        console.log({ user, ok: true, message: "User fetched successfully" });
        res.status(200).json({ user, ok: true, message: "User fetched successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch user or Internal Server Error", error: err.message });
        next(err);
    }
};

export const updateRoles = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) return res.status(401).json({ error: "Unauthorized", message: "User not authenticated" });
        // Update roles logic
        console.log({ ok: true, message: "Roles updated" });
        res.status(200).json({ ok: true, message: "Roles updated" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to update roles or Internal Server Error", error: err.message });
        next(err);
    }
};

export const listUsers = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) return res.status(401).json({ error: "Unauthorized", message: "User not authenticated" });
        const users = await User.find();
        if (!users || users.length === 0) return res.status(404).json({ message: "No users found", error: "Not Found" });
        console.log({ users, ok: true, message: "Users fetched successfully" });
        res.status(200).json({ users, ok: true, message: "Users fetched successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch users or Internal Server Error", error: err.message });
        next(err);
    }
};

// Global revocation (emergency logout all users)
export const revokeAllTokens = async (req, res) => {
  try {
    await User.updateMany({}, { 
      $set: { lastRevocation: new Date() },
      $inc: { tokenVersion: 1 }
    });
    
    res.status(200).json({ 
      ok: true, 
      message: "All tokens revoked globally" 
    });
  } catch (err) {
    return res.status(500).json({ message: "Revocation failed", error: err.message });
  }
};