import mongoose from "mongoose";

const AttendanceEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  userType: {
    type: String,
    enum: ["Student", "Teacher", "Staff", "Librarian", "Placement", "Admin", "SuperAdmin"],
    required: true,
    index: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: false  // Only for Student type
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    required: false  // Only for Teacher type
  },
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Staff",  // Add Staff model if needed
    required: false  // Only for Staff type
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: false  // Required for academic contexts
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",  // For non-academic events
    required: false
  },
  checkInTime: {
    type: Date,
    default: Date.now
  },
  checkOutTime: {
    type: Date
  },
  status: {
    type: String,
    enum: [
      "present", "absent", "late", "excused",
      "on-leave", "sick", "official-duty",
      "early-departure", "half-day"
    ],
    default: "present"
  },
  duration: {
    type: Number,  // In minutes
    default: 0
  },
  remarks: {
    type: String,
    maxlength: 500
  }
}, {
  _id: false  // Don't create separate _id for subdocument
})

const AttendanceSchema = new mongoose.Schema({
  // Context identifier
  sessionId: {
    type: String,
    required: true,
    unique: true  // Unique session identifier
  },
  // Academic or Event context
  context: {
    type: String,
    enum: ["class", "meeting", "workshop", "seminar", "event", "training"],
    required: true,
    index: true
  },
  // Subject/Topic for academic contexts
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    index: true
  },
  // Course context
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    index: true
  },
  // Department context
  deptId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    index: true
  },
  // Session details
  sessionDate: {
    type: Date,
    required: true,
    index: true
  },
  sessionStart: {
    type: Date,
    required: true
  },
  sessionEnd: {
    type: Date,
    required: true
  },
  // Location (classroom, online, etc.)
  location: {
    type: {
      type: String,
      enum: ["classroom", "lab", "online", "workshop", "auditorium", "other"],
      default: "classroom"
    },
    roomNo: String,
    building: String,
    platform: String  // For online sessions
  },
  // Responsible person
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  // Attendance entries for all participants
  entries: [AttendanceEntrySchema],
  // Session summary
  totalPresent: {
    type: Number,
    default: 0
  },
  totalAbsent: {
    type: Number,
    default: 0
  },
  totalLate: {
    type: Number,
    default: 0
  },
  attendancePercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  // Metadata
  status: {
    type: String,
    enum: ["active", "closed", "cancelled"],
    default: "active"
  },
  meta: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

// Compound indexes for efficient queries
AttendanceSchema.index({ sessionDate: 1, context: 1 });
AttendanceSchema.index({ subjectId: 1, sessionDate: 1 });
AttendanceSchema.index({ deptId: 1, sessionDate: 1 });
AttendanceSchema.index({ courseId: 1, sessionDate: 1 });

// Method to calculate attendance percentage
AttendanceSchema.methods.calculateAttendance = function() {
  const totalEntries = this.entries.length;
  if (totalEntries === 0) return 0;
  
  const presentCount = this.entries.filter(entry => 
    entry.status === 'present'
  ).length;
  
  this.totalPresent = presentCount;
  this.totalAbsent = totalEntries - presentCount;
  this.totalLate = this.entries.filter(entry => 
    entry.status === 'late'
  ).length;
  
  this.attendancePercentage = Math.round((presentCount / totalEntries) * 100);
  return this.attendancePercentage;
};

// Method to add attendance entry
AttendanceSchema.methods.addEntry = function(entryData) {
  const entry = new AttendanceEntrySchema(entryData);
  this.entries.push(entry);
  this.calculateAttendance();
  return this;
};

// Method to update entry status
AttendanceSchema.methods.updateEntry = function(userId, updateData) {
  const entryIndex = this.entries.findIndex(e => 
    e.userId.toString() === userId.toString()
  );
  
  if (entryIndex !== -1) {
    Object.assign(this.entries[entryIndex], updateData);
    this.calculateAttendance();
    return true;
  }
  return false;
};

// Static method to find attendance by user and date range
AttendanceSchema.statics.findUserAttendance = async function(userId, startDate, endDate, userType) {
  return this.aggregate([
    {
      $match: {
        'entries.userId': new mongoose.Types.ObjectId(userId),
        sessionDate: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $unwind: '$entries'
    },
    {
      $match: {
        'entries.userId': new mongoose.Types.ObjectId(userId),
        'entries.userType': userType
      }
    },
    {
      $group: {
        _id: {
          month: { $month: '$sessionDate' },
          year: { $year: '$sessionDate' }
        },
        totalSessions: { $sum: 1 },
        presentCount: {
          $sum: { $cond: [{ $eq: ['$entries.status', 'present'] }, 1, 0] }
        },
        sessions: {
          $push: {
            date: '$sessionDate',
            status: '$entries.status',
            subject: '$subjectId',
            context: '$context'
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        month: '$_id.month',
        year: '$_id.year',
        attendancePercentage: {
          $round: [
            { $multiply: [
              { $divide: ['$presentCount', '$totalSessions'] },
              100
            ] },
            2
          ]
        },
        totalSessions: 1,
        presentCount: 1,
        absentCount: { $subtract: ['$totalSessions', '$presentCount'] }
      }
    }
  ]);
};

// Virtual for session duration
AttendanceSchema.virtual('sessionDuration').get(function() {
  if (this.sessionStart && this.sessionEnd) {
    const duration = (this.sessionEnd - this.sessionStart) / (1000 * 60);
    return Math.round(duration);
  }
  return 0;
});

export default AttendanceSchema;
