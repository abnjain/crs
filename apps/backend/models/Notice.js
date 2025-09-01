import mongoose from "mongoose";

const NoticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  audience: { 
    type: String, 
    default: "all" 
  }, // all | students | teachers | dept:<id>
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  },
  publishAt: {
    type: Date,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  pinned: { 
    type: Boolean, 
    default: false 
  }
}, { timestamps: true });

export default NoticeSchema;
