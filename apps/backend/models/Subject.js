import mongoose from "mongoose";

const SubjectSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId, ref: "Course"
  },
  code: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  semester: {
    type: Number,
    required: true
  },
  credits: {
    type: Number
  }
}, { timestamps: true });

SubjectSchema.index({ courseId: 1, semester: 1 });

export default SubjectSchema;
