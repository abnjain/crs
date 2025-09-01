import {Attendance} from "../models/index.js";

export async function markAttendance(req, res, next) {
  try {
    if (!req.body) return res.status(400).json({ message: "No Data Found", error: "Bad Request" });
    const { subjectId, classDate, entries } = req.body;
    if (!subjectId || !classDate || !entries) return res.status(400).json({ message: "SubjectId, ClassDate and Entries are required", error: "Bad Request" });
    const marked = await Attendance.create({ subjectId, classDate, teacherId: req.user?._id, entries });
    res.status(201).json({marked, ok: true, message: "Attendance marked successfully"});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to mark attendance or Internal Server Error", error: "Database Error" });
    next(err);
  }
}

export async function queryAttendance(req, res, next) {
  try {
    const q = {};
    if (req.query.studentId) q["entries.studentId"] = req.query.studentId;
    if (req.query.subjectId) q.subjectId = req.query.subjectId;
    if (req.query.from || req.query.to) {
      q.classDate = {};
      if (req.query.from) q.classDate.$gte = new Date(req.query.from);
      if (req.query.to) q.classDate.$lte = new Date(req.query.to);
    }
    const list = await Attendance.find(q);
    if (!list || list.length === 0) return res.status(404).json({ message: "No attendance records found", error: "Not Found" });
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to query attendance or Internal Server Error", error: "Database Error" });
    next(err);
  }
}

export async function summary(req, res, next) {
  try {
    if (!req.user.roles.includes("Admin", "SuperAdmin")) return res.status(403).json({ error: "Forbidden", message: "Insufficient Permissions" });
    if (!req.query) return res.status(400).json({ message: "No query parameters provided", error: "Bad Request" });
    const { subjectId, month } = req.query;
    // Minimal summary: count sessions and average present ratio
    const match = { subjectId };
    const docs = await Attendance.find(match);
    res.json({ sessions: docs.length, docs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to retrieve attendance summary or Internal Server Error", error: "Database Error" });
    next(err);
  }
}
