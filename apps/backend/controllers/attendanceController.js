import { Attendance, Teacher } from "../models/index.js";

export async function markAttendance(req, res, next) {
  try {
    if (!req.body) return res.status(400).json({ message: "No Data Found", error: "Bad Request" });
    const { subjectId, classDate, entries } = req.body;
    if (!subjectId || !classDate || !entries) return res.status(400).json({ message: "SubjectId, ClassDate and Entries are required", error: "Bad Request" });
    const marked = await Attendance.create({ subjectId, classDate, teacherId: req.user?._id, entries });
    return res.status(201).json({ marked, ok: true, message: "Attendance marked successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to mark attendance or Internal Server Error", error: "Database Error" });
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
    return res.json(list);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to query attendance or Internal Server Error", error: "Database Error" });
  }
}

export async function summary(req, res, next) {
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

    const { subjectId, classId, month } = req.query;

    // Build match criteria
    const match = {};
    if (subjectId) match.subject = subjectId;
    if (classId) match.class = classId;

    // If teacher role, filter by their assigned subjects
    if (roles.includes("Teacher")) {
      const teacher = await Teacher.findById(req.user._id);
      if (teacher && teacher.subjects.length > 0) {
        match.subject = { $in: teacher.subjects };
      }
    }

    // Add date filter if month provided
    if (month) {
      const date = new Date();
      const currentYear = date.getFullYear();
      const [monthNum] = month.split('-').map(Number);
      const startOfMonth = new Date(currentYear, monthNum - 1, 1);
      const endOfMonth = new Date(currentYear, monthNum, 0);

      match.date = {
        $gte: startOfMonth,
        $lte: endOfMonth
      };
    }

    // Aggregate attendance data
    const attendanceData = await Attendance.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            subject: "$subject",
            class: "$class"
          },
          totalSessions: { $sum: 1 },
          totalPresent: {
            $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] }
          },
          totalAbsent: {
            $sum: { $cond: [{ $eq: ["$status", "absent"] }, 1, 0] }
          },
          students: { $addToSet: "$student" }
        }
      },
      {
        $project: {
          _id: 0,
          subject: "$_id.subject",
          class: "$_id.class",
          totalSessions: 1,
          totalPresent: 1,
          totalAbsent: 1,
          attendancePercentage: {
            $round: [
              {
                $multiply: [
                  { $divide: ["$totalPresent", "$totalSessions"] },
                  100
                ]
              },
              2
            ]
          },
          uniqueStudents: { $size: "$students" }
        }
      }
    ]);

    // Calculate overall average
    const totalPresent = attendanceData.reduce((sum, item) => sum + item.totalPresent, 0);
    const totalSessions = attendanceData.reduce((sum, item) => sum + item.totalSessions, 0);
    const averageAttendance = totalSessions > 0 ?
      Math.round((totalPresent / totalSessions) * 100 * 100) / 100 : 0;

    const result = {
      byClass: attendanceData.map(item => ({
        class: item.class,
        subject: item.subject,
        att: item.attendancePercentage,
        sessions: item.totalSessions,
        present: item.totalPresent,
        absent: item.totalAbsent,
        students: item.uniqueStudents
      })),
      averageAttendance,
      totalSessions,
      totalPresent,
      totalUniqueStudents: new Set(attendanceData.map(item => item.students)).size,
      message: "Attendance summary fetched successfully"
    };

    return res.status(200).json(result);
  } catch (err) {
    console.error('Attendance summary error:', err);
    return res.status(500).json({
      message: "Failed to retrieve attendance summary",
      error: err.message
    });
  }
}
