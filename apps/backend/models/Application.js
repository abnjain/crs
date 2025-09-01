import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema({
  jobId: { 
    type: mongoose.Schema.Types.ObjectId, ref: "Job" 
  },
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, ref: "Student" 
  },
  resumeKey: { 
    type: String 
  },
  status: { 
    type: String, enum: ["applied","shortlisted","rejected","selected","withdrawn","pending"], default: "pending" 
  },
  appliedAt: { 
    type: Date, default: Date.now 
  }
}, { timestamps: true });

export default ApplicationSchema;
