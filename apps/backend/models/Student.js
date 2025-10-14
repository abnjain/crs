import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
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
    ref: "Course",
    required: true
  },
  enrollmentNo: {
    type: String,
    required: true,
    unique: true,
    index: true
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
  },
  alumniStatus: {
    type: String,
    enum: ['current', 'graduated', 'alumni'],
    default: 'current'
  },
  alumniId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Alumnus",
    default: null
  },
  graduationDate: {
    type: Date,
    default: null
  }
}, { timestamps: true });

export default StudentSchema;
