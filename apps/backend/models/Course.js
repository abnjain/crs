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
  durationYears: {
    type: Number
  },
  semesters: {
    type: Number
  }
}, { timestamps: true });

export default CourseSchema;
