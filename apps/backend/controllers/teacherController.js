import { Teacher, User, Material } from "../models/index.js";

export const createTeacher = async (req, res, next) => {
  try {
    if (!req.body) return res.status(400).json({ error: "Invalid Input", message: "User ID, Employee Code, Department ID, and Designation are required" });
    const { userId, empCode, deptId, designation } = req.body;
    if (!userId || !empCode) return res.status(400).json({ message: "UserId and empCode required", error: "Invalid Input" });
    const teacher = await Teacher.create({ user: userId, empCode, deptId, designation });
    res.status(201).json({ ok: true, teacher, message: "Teacher created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Can't Create Teacher or Internal Server Error", error: err.message });
    next(err);
  }
};

// teacher uploads material - basic placeholder
export const uploadMaterial = async (req, res, next) => {
  try {
    if (!req.body) return res.status(400).json({ error: "Invalid Input", message: "Subject ID, Title, and File Key are required" });
    const { subjectId, title, fileKey } = req.body;
    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher) return res.status(403).json({ error: "Not a teacher" });
    const material = await Material.create({ subjectId, teacherId: teacher._id, title, fileKey, publishedAt: new Date() });
    res.status(201).json({ ok: true, material, message: "Material uploaded successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Can't Upload Material or Internal Server Error", error: err.message });
    next(err);
  }
};
