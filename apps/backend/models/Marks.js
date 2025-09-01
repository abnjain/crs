import mongoose from "mongoose";

const MarkSchema = new mongoose.Schema({
  examId: { 
    type: mongoose.Schema.Types.ObjectId, ref: "Exam" 
  },
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, ref: "Student" 
  },
  marksObtained: { 
    type: Number 
  },
  grade: { 
    type: String 
  },
  enteredBy: { 
    type: mongoose.Schema.Types.ObjectId, ref: "Teacher" 
  }
}, { timestamps: true });

MarkSchema.index({ examId: 1, studentId: 1 }, { unique: true });

export default MarkSchema;
