import mongoose from "mongoose";

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  location: {
    type: String,
  },
  description: {
    type: String,
  },
  eligibility: {
    type: mongoose.Schema.Types.Mixed,
  },
  deadline: {
    type: Date,
    required: true
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
}, { timestamps: true });

export default JobSchema;
