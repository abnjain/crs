import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema({
  title: {
    type: String
  },
  type: {
    type: String, enum: ["syllabus", "circular", "notes", "paper", "researches", "other"],
    default: "other"
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId, ref: "User"
  },
  visibility: {
    type: {
      type: String,
      enum: ["public", "restricted"],
      default: "restricted"
    },
    roles: [{ type: String }],
    deptIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Department" }],
    courseIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }]
  },
  currentVersion: {
    fileKey: {
      type: String
    },
    size: {
      type: Number
    },
    uploadedAt: {
      type: Date
    }
  },
  versions: [mongoose.Schema.Types.Mixed],
  tags: [String]
}, { timestamps: true });

export default DocumentSchema;
