import mongoose from "mongoose";

const TeacherSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  empCode: {
    type: String,
    required: true,
    unique: true
  },
  deptId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    index: true
  },
  designation: {
    type: String
  },
  expertise: [{ 
    type: String,
    default: []
  }],
  achievements: [{
    type: String,
    default: []
  }]
}, { timestamps: true });

export default TeacherSchema;
