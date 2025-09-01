import { Enrollment, Timetable } from "../models/index.js";

export async function createEnrollment(req, res, next) {
  try {
    if (!req.body) return res.status(400).json({ message: "StudentId is required", error: "No Data Found" });
    const enrolled = await Enrollment.create(req.body);
    if (!enrolled) return res.status(500).json({ message: "Failed to create enrollment", error: "Database Error" });
    res.status(201).json({ enrolled, ok: true, message: "Enrollment created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create enrollment or Internal Server Error", error: "Database Error" });
    next(err);
  }
};

export async function listEnrollments(req, res, next) {
  try {
    if (!req.user.roles.includes("Teacher", "Admin", "SuperAdmin")) return res.status(403).json({ error: "Forbidden", message: "Insufficient Permissions" });
    if (!req.query) return res.status(400).json({ message: "No query parameters provided", error: "Bad Request" });
    const q = {};
    if (req.query.studentId) q.studentId = req.query.studentId;
    const list = await Enrollment.find(q).populate("studentId courseId subjects");
    res.status(200).json({ list, ok: true, message: "Enrollments retrieved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to list enrollments or Internal Server Error", error: "Database Error" });
    next(err);
  }
};

export async function createTimetable(req, res, next) {
  try {
    if (!req.user.roles.includes("Teacher", "Admin", "SuperAdmin")) return res.status(403).json({ error: "Forbidden", message: "Insufficient Permissions" });
    if (!req.body) return res.status(400).json({ message: "No Data Found", error: "Bad Request" });
    if (!req.body.courseId || !req.body.section) return res.status(400).json({ message: "CourseId and Section are required", error: "Bad Request" });
    const timetable = await Timetable.create(req.body);
    res.status(201).json({ timetable, ok: true, message: "Timetable created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create timetable or Internal Server Error", error: "Database Error" });
    next(err);
  }
};

export async function listTimetables(req, res, next) {
  try {
    if (!req.user.roles.includes("Teacher", "Admin", "SuperAdmin")) return res.status(403).json({ error: "Forbidden", message: "Insufficient Permissions" });
    if (!req.query) return res.status(400).json({ message: "No query parameters provided", error: "Bad Request" });
    const q = {};
    if (req.query.course) q.courseId = req.query.course;
    if (req.query.section) q.section = req.query.section;
    const list = await Timetable.find(q);
    res.status(200).json({ list, ok: true, message: "Timetables retrieved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to list timetables or Internal Server Error", error: "Database Error" });
    next(err);
  }
};