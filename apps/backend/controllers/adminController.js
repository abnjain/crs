import { Teacher, User, Student, Department, Course } from "../models/index.js";
import bcrypt from "bcrypt";

export const createUser = async (req, res, next) => {
  try {
      if (!req.body) return res.status(400).json({ message: "Valid Input of email, password and phone are required", error: "Invalid Input" });
      const { email, password, phone, name, roles } = req.body;
      // create user is done via auth controller typically; admin utility:
      const hash = await bcrypt.hash(password, 10);
      const exists = await User.findOne({ email, phone });
      if (exists) return res.status(400).json({ message: "Account already exists", error: "Invalid Input" });
      const user = await User.create({ email, password: hash, phone, name, roles });
      const safeUser = user.toObject();
      delete safeUser.password;
      res.status(200).json({ user: safeUser, ok: true, message: "User created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Can't create user or Internal Server Error", error: err.message });
    next(err);
  }
};

// simple reports endpoint (counts)
export const getOverview = async (req, res, next) => {
  try {
    const users = await User.countDocuments();
    const students = await Student.countDocuments();
    const teachers = await Teacher.countDocuments();
    res.status(200).json({ users, students, teachers, ok: true, message: "Overview fetched successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Can't fetch overview or Internal Server Error", error: err.message });
    next(err);
  }
};
