import mongoose from "mongoose";

const MaterialSchema = new mongoose.Schema({
  subjectId: { 
    type: mongoose.Schema.Types.ObjectId, ref: "Subject" 
  },
  teacherId: { 
    type: mongoose.Schema.Types.ObjectId, ref: "Teacher" 
  },
  title: {
    type: String
  },
  fileKey: {
    type: String
  },
  mime: {
    type: String
  },
  meta: {
    type: mongoose.Schema.Types.Mixed
  },
  publishedAt: {
    type: Date
  }
}, { timestamps: true });

export default MaterialSchema;
