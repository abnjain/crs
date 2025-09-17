import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema({
  deptId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department"
  },
  code: {
    type: String,
    unique: true
  },
  name: {
    type: String
  },
  active: {
    type: Boolean,
    default: true
  },
  stream: {
    type: String,
    enum: ['CSE', 'ME', 'CE', 'ECE', 'EE', 'IT', 'IA&SE', 'AIDS', 'NM&IS', 'CY', 'AI', 'DS'], // Add more if needed, e.g., 'EE', 'IT'
    required: true
  },
  batch: {
    type: String,
  },
  durationYears: {
    type: Number
  },
  semesters: {
    type: Number
  }
}, { timestamps: true });

CourseSchema.index({ deptId: 1, stream: 1, code: 1 });

export default CourseSchema;
