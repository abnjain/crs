import { Student, User } from "../models/index.js";

// create student profile (admin)
export const createStudent = async (req, res, next) => {
  try {
    if (!req.body) return res.status(400).json({ error: "Invalid Input", message: "User ID, Roll No, Admission Year, and Section are required" });
    const { userId, rollNo, admissionYear, section } = req.body;
    if (!userId || !rollNo) return res.status(400).json({ message: "userId and rollNo required", error: "Invalid Input" });
    const user = await User.findById(userId);
    if (!user) return res.status(400).json({ message: "user not found", error: "Not Found" });
    const student = await Student.create({ user: userId, rollNo, admissionYear, section });
    if (!student) return res.status(400).json({ message: "Failed to create student", error: "Invalid User Details" });
    res.status(201).json({ ok: true, student, message: "Student created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Can't Create Student or Internal Server Error", error: err.message });
    next(err);
  }
};

export const getMyProfile = async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized", error: "Invalid User" });
    const student = await Student.findOne({ user: req.user._id }).populate("user");
    if (!student) return res.status(404).json({ message: "Student profile not found. Please Contact Admin or Support", error: "Not Found" });
    res.status(200).json({ ok: true, student, message: "Student profile fetched successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Can't Fetch Student Profile or Internal Server Error", error: err.message });
    next(err);
  }
};

export const updateStudent = async (req, res, next) => {
  try {
    const { enrollmentNo } = req.params;
    const { rollNo, admissionYear, section } = req.body;
    const student = await Student.findOneAndUpdate(
      { enrollmentNo },
      { rollNo, admissionYear, section },
      { new: true }
    );
    if (!student) return res.status(404).json({ message: "Student not found. Please Contact Admin or Support", error: "Not Found" });
    res.status(200).json({ ok: true, message: "Student updated", student });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Can't Update Details or Internal Server Error", error: err.message });
    next(err);
  }
};

export const listStudents = async (req, res, next) => {
  try {
    const students = await Student.find().populate("user");
    res.status(200).json({ ok: true, students, message: "Student list fetched successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Can't Fetch Students or Internal Server Error", error: err.message });
    next(err);
  }
};

export const getIdCard = async (req, res, next) => {
  try {
    const idCard = await Student.findOne({ student: req.params.enrollmentNo });
    if (!idCard) return res.status(404).json({ message: "ID Card not found. Please Contact Admin or Support", error: "Not Found" });
    res.status(200).json({ ok: true, idCard, message: "ID Card fetched successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Can't Fetch ID Card or Internal Server Error", error: err.message });
    next(err);
  }
};

export const generateIdCard = async (req, res, next) => {
  try {
    const { enrollmentNo } = req.params;
    const { name, course, year } = req.body;
    const existingIdCard = await Student.findOne({ student: enrollmentNo });
    if (existingIdCard) return res.status(400).json({ message: "ID Card already exists. Please Contact Admin or Support", error: "Bad Request" });
    const idCard = await Student.create({ student: enrollmentNo, name, course, year });
    res.status(200).json({ ok: true, idCard, message: "ID Card generated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Can't Generate ID Card or Internal Server Error", error: err.message });
    next(err);
  }
};