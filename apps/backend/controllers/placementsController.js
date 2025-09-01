import { Job, Student, Application } from "../models/index.js";

export const createJob = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: "Only admins can create jobs", error: "Forbidden" });
    if (!req.body) return res.status(400).json({ message: "Valid job data required", error: "Invalid Input" });
    const job = await Job.create({ ...req.body, postedBy: req.user._id });
    res.status(201).json({ job, message: "Job created successfully", ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Can't create job or Internal Server Error", error: err.message });
    next(err);
  }
};

export async function listJobs(req, res, next) {
  try {
    const q = {};
    if (req.query.q) q.$text = { $search: req.query.q };
    if (req.query.company) q.company = req.query.company;
    const list = await Job.find(q).limit(200);
    if (!list || list.length === 0) return res.status(404).json({ message: "No Jobs Found for query: " + JSON.stringify(req.query), error: "Not Found" });
    res.status(200).json({list, message: "Jobs fetched successfully", ok: true });
  } catch (err) { 
    console.error(err);
    res.status(500).json({ message: "Failed to fetch jobs or Internal Server Error", error: err.message });
    next(err);
  }
}

export const applyJob = async (req, res, next) => {
  try {
    if (req.user.role !== 'student') return res.status(403).json({ message: "Only students can apply", error: "Forbidden" });
    if (!req.body) return res.status(400).json({ message: "JobId and ResumeKey are required", error: "Invalid Input" });
    const { jobId, resumeKey } = req.body;
    const student = await Student.findOne({ user: req.user._id });
    if (!student) return res.status(403).json({ message: "Only students can apply", error: "Forbidden" });
    const app = await Application.create({ jobId, studentId: student._id, resumeKey });
    res.status(201).json({ app, message: "Job application created successfully", ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Can't create job application or Internal Server Error", error: err.message });
    next(err);
  }
};

export async function listApplications(req, res, next) {
  try {
    const q = {};
    if (req.query.studentId) q.studentId = req.query.studentId;
    const list = await Application.find(q).populate("jobId studentId");
    if (!list || list.length === 0) return res.status(404).json({ message: "No Applications Found for query: " + JSON.stringify(req.query), error: "Not Found" });
    res.status(200).json({ list, message: "Applications fetched successfully", ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch applications or Internal Server Error", error: err.message });
    next(err);
  }
}