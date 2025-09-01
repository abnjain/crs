import mongoose from "mongoose";

const ExamSchema = new mongoose.Schema({
  subjectId: { 
    type: mongoose.Schema.Types.ObjectId, ref: "Subject" 
  },
  name: {
    type: String
  },
  type: { 
    type: String, enum: ["midterm","final","quiz","assignment"], default: "midterm" 
  },
  date: {
    type: Date
  },
  maxMarks: {
    type: Number
  }
}, { timestamps: true });

export default ExamSchema;
