import { config } from "../config/config.js";
import { Exam, Marks } from "../models/index.js";

export async function createExam(req, res, next) {
  try {
    if (!req.user || !req.user._id || !req.user.roles.includes("Teacher", "Admin", "SuperAdmin")) return res.status(401).json({ error: "Unauthorized", message: "Insufficient Permissions" });
    if (!req.body) return res.status(400).json({ message: "No Data Found", error: "Bad Request" });
    const { title, subjectId, date, duration, totalMarks } = req.body;
    const exam = await Exam.create({ title, subjectId, date, duration, totalMarks });
    res.status(201).json({ exam, message: "Exam Created Successfully", ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error", error: "Something went wrong" });
    next(err);
  }
};

export async function listExams(req, res, next) {
  try {
    if (!req.user || !req.user._id) return res.status(401).json({ message: "No User Found", error: "Unauthorized" });
    const q = {};
    if (req.query.subjectId) q.subjectId = req.query.subjectId;
    const list = await Exam.find(q);
    if (!list || list.length === 0) return res.status(404).json({ message: "No Exams Found", error: "Not Found" });
    res.status(200).json({ list, message: "Exams Retrieved Successfully", ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error", error: "Something went wrong" });
    next(err);
  }
};

export async function bulkMarks(req, res, next) {
  try {
    if (!req.user || !req.user._id || !req.user.roles.includes("Teacher", "Admin", "SuperAdmin")) return res.status(401).json({ error: "Unauthorized", message: "Insufficient Permissions" });
    const { examId, entries } = req.body; // entries: [{ studentId, marksObtained }]
    const ops = entries.map(en => ({ updateOne: { filter: { examId, studentId: en.studentId }, update: { $set: { marksObtained: en.marksObtained, enteredBy: req.user._id } }, upsert: true } }));
    const uploaded = await Marks.bulkWrite(ops);
    res.status(200).json({ ok: true, uploaded, message: "Marks Uploaded Successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error", error: "Something went wrong" });
    next(err);
  }
};

export async function queryMarks(req, res, next) {
  try {
    const q = {};
    if (req.query.studentId) q.studentId = req.query.studentId;
    if (req.query.examId) q.examId = req.query.examId;
    const list = await Marks.find(q);
    if (!list || list.length === 0) return res.status(404).json({ message: "No Marks Found", error: "Not Found" });
    res.status(200).json({ list, message: "Marks Retrieved Successfully", ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error", error: "Something went wrong" });
    next(err);
  }
};

export async function gradesheet(req, res, next) {
  try {
    // Placeholder: return link to generated PDF
    res.json({ url: `${config.server.frontendUrl}/grades/${req.params.studentId}/${req.params.term}.pdf`, message: "Gradesheet Generated Successfully", ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error", error: "Something went wrong" });
    next(err);
  }
}
