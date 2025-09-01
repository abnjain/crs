import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema({
  subjectId: { 
    type: mongoose.Schema.Types.ObjectId, ref: "Subject" 
  },
  classDate: { 
    type: Date, required: true 
  },
  teacherId: { 
    type: mongoose.Schema.Types.ObjectId, ref: "Teacher" 
  },
  entries: [{ 
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" }, 
    status: { type: String, enum: ["present","absent","late","excused"], default: "present" } 
  }]
}, { timestamps: true });

export default AttendanceSchema;
