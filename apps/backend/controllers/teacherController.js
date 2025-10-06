import { Teacher, User, Material, Timetable, Subject } from "../models/index.js";

export const createTeacher = async (req, res, next) => {
  try {
    if (!req.body) return res.status(400).json({ error: "Invalid Input", message: "User ID, Employee Code, Department ID, and Designation are required" });
    const { userId, empCode, deptId, designation } = req.body;
    if (!userId || !empCode) return res.status(400).json({ message: "UserId and empCode required", error: "Invalid Input" });
    const teacher = await Teacher.create({ user: userId, empCode, deptId, designation });
    return res.status(201).json({ ok: true, teacher, message: "Teacher created successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Can't Create Teacher or Internal Server Error", error: err.message });
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
    return res.status(201).json({ ok: true, material, message: "Material uploaded successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Can't Upload Material or Internal Server Error", error: err.message });
  }
};


// apps/backend/controllers/teacherController.js
// Add this new function for upcoming classes

export const getUpcomingClasses = async (req, res, next) => {
  try {
    const roles = req.user.roles || [];
    if (!roles.includes("Teacher")) {
      return res.status(403).json({
        message: "Only teachers can access this",
        error: "Forbidden"
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get upcoming 7 days
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 7);

    const classes = await Timetable.find({
      teacher: req.user._id,
      date: {
        $gte: today,
        $lte: endDate
      }
    })
      .sort('date')
      .populate('subject', 'name code')
      .limit(10);

    if (!classes.length) {
      return res.status(200).json({
        classes: [],
        message: "No upcoming classes found"
      });
    }

    const formattedClasses = classes.map(c => {
      const time = new Date(c.time);
      return {
        _id: c._id,
        subject: c.subject?.name || 'Unknown Subject',
        code: c.subject?.code || 'N/A',
        section: c.section || 'N/A',
        date: c.date.toISOString().split('T')[0],
        time: time.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        room: c.room || 'TBD',
        duration: c.duration || '1 hour'
      };
    });

    return res.status(200).json({
      classes: formattedClasses,
      message: "Upcoming classes fetched successfully"
    });
  } catch (error) {
    console.error('Upcoming classes error:', error);
    return res.status(500).json({
      message: "Failed to fetch upcoming classes",
      error: error.message
    });
  }
};

// apps/backend/controllers/teacherController.js
// Add this function for my subjects

export const getMySubjects = async (req, res, next) => {
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
    
    const teacher = await Teacher.findById(req.user.id)
      .populate({
        path: 'subjects',
        select: 'name code credits semester section',
        populate: {
          path: 'course',
          select: 'name code'
        }
      });

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const subjects = teacher.subjects.map(sub => ({
      _id: sub._id,
      name: sub.name,
      code: sub.code,
      credits: sub.credits,
      semester: sub.semester,
      section: sub.section,
      course: sub.course ? `${sub.course.name} (${sub.course.code})` : 'N/A',
      totalStudents: 0, // Can be calculated from enrollments
    }));

    return res.status(200).json({
      subjects,
      totalSubjects: subjects.length,
      message: "Subjects fetched successfully"
    });
  } catch (error) {
    console.error('My subjects error:', error);
    return res.status(500).json({
      message: "Failed to fetch subjects",
      error: error.message
    });
  }
};  