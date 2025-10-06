// apps/backend/controllers/analyticsController.js
import { User, Student, Teacher, Loan } from "../models/index.js";

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

export async function performance(req, res, next) {
  try {
    const roles = req.user.roles || [];
    const allowed = ["Admin", "SuperAdmin", "Teacher"];
    const ok = roles.some(r => allowed.includes(r));

    if (!ok) {
      return res.status(403).json({
        message: "Only admins and teachers can access here",
        error: "Forbidden"
      });
    }

    const { subjectId, classId } = req.query;

    // If no subjectId provided, get all subjects for this teacher
    if (!subjectId) {
      const teacher = await Teacher.findById(req.user._id).populate('subjects');
      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }

      const subjects = teacher.subjects.map(s => ({
        _id: s._id,
        name: s.name,
        code: s.code,
        avgMarks: 0 // placeholder
      }));

      return res.status(200).json({ bySubject: subjects, averageMarks: 0, totalStudents: 0, message: "Performance data fetched successfully" });
    }

    // Get marks for specific subject
    const match = {
      subject: subjectId,
      ...(classId && { class: classId })
    };

    const marksData = await Marks.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$student",
          totalMarks: { $sum: "$marks" },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          avgMarks: { $avg: "$totalMarks" },
          totalStudents: { $sum: 1 }
        }
      }
    ]);

    const result = {
      bySubject: [{ subject: subjectId, avgMarks: marksData[0]?.avgMarks || 0, totalStudents: marksData[0]?.totalStudents || 0 }],
      averageMarks: marksData[0]?.avgMarks || 0,
      totalStudents: marksData[0]?.totalStudents || 0,
      message: "Performance data fetched successfully"
    };

    res.status(200).json(result);
  } catch (err) {
    console.error('Performance analytics error:', err);
    res.status(500).json({
      message: "Failed to fetch performance data",
      error: err.message
    });
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
