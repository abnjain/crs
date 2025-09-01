import { User, Student, Teacher, Loan, Attendance } from "../models/index.js";

export async function overview(req, res, next) {
  try {
    if (req.user.role !== 'Admin' || req.user.role !== "SuperAdmin") return res.status(403).json({ message: "Only admins can access here", error: "Forbidden" });
    const users = await User.countDocuments();
    const students = await Student.countDocuments();
    const teachers = await Teacher.countDocuments();
    const loans = await Loan.countDocuments({ returnedOn: null });
    if (users === null || students === null || teachers === null || loans === null) return res.status(404).json({ message: "No overview data found", error: "Not Found" });
    res.status(200).json({ users, students, teachers, activeLoans: loans, ok: true, message: "overview fetched successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch overview or Internal Server Error", error: err.message });
    next(err);
  }
}

export async function attendanceAnalytics(req, res, next) {
  try {
    if (req.user.role !== 'Admin' && req.user.role !== "SuperAdmin") return res.status(403).json({ message: "Only admins can access here", error: "Forbidden" });
    // simple: attendance count per subject for month
    const { course, month } = req.query;
    const docs = await Attendance.find({}); // refine as needed
    if (!docs) return res.status(404).json({ message: "No attendance analytics found", error: "Not Found" });
    res.status(200).json({ count: docs.length, docs: docs.slice(0, 50), ok: true, message: "Attendance analytics fetched successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch attendance analytics or Internal Server Error", error: err.message });
    next(err);
  }
}

export async function performance(req, res, next) {
  try {
    if (req.user.role !== 'Admin' && req.user.role !== "SuperAdmin" && req.user.role !== "Teacher") return res.status(403).json({ message: "Only admins and teachers can access here", error: "Forbidden" });
    const subjectId = req.query.subjectId;
    // placeholder
    res.status(200).json({ subjectId, avg: 0, ok: true, message: "Performance data fetched successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch performance data or Internal Server Error", error: err.message });
    next(err);
  }
}

export async function libraryAnalytics(req, res, next) {
  try {
    const top = await Loan.aggregate([{ $match: {} }, { $group: { _id: "$bookId", count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 10 }]);
    if (!top) return res.status(404).json({ message: "No library analytics found", error: "Not Found" });
    res.status(200).json({ top, ok: true, message: "Library analytics fetched successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch library analytics or Internal Server Error", error: err.message });
    next(err);
  }
}
