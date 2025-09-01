import mongoose from "mongoose";

const SubjectSchema = new mongoose.Schema({
  courseId: { 
    type: mongoose.Schema.Types.ObjectId, ref: "Course" 
  },
  code: { 
    type: String, unique: true 
  },
  name: {
    type: String
  },
  semester: {
    type: Number
  },
  credits: {
    type: Number
  }
}, { timestamps: true });

export default SubjectSchema;
