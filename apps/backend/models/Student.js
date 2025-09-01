import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true, 
    unique: true 
  },
  rollNo: { 
    type: String, 
    required: true, 
    unique: true 
  },
  admissionYear: Number,
  courseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Course" 
  },
  enrollmentNo: { 
    type: String, 
    required: true, 
    unique: true 
  },
  section: {
    type: String
  },
  dob: {
    type: Date
  },
  address: {
    type: String
  },
  guardian: {
    type: String
  },
  meta: {
    type: mongoose.Schema.Types.Mixed
  }
}, { timestamps: true });

export default StudentSchema;
