import mongoose from "mongoose";

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  company: {
    type: String,
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
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
}, { timestamps: true });

export default JobSchema;
