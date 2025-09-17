import mongoose from "mongoose";

const NoticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  body: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000
  },
  audience: [{ 
    type: String, 
    enum: ["all", "students", "teachers", "staff", "librarian", "placement", "admin", "superadmin"],
    default: "all" 
  }], // Clean enum instead of free text
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true,
    index: true
  },
  publishAt: {
    type: Date,
    required: true,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  pinned: { 
    type: Boolean, 
    default: false 
  },
  // Additional fields for better functionality
  readBy: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    readAt: { type: Date, default: Date.now }
  }],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  // Auto-expire notices
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Indexes for efficient queries
NoticeSchema.index({ createdBy: 1, createdAt: -1 });
NoticeSchema.index({ publishAt: 1, expiresAt: 1 });
NoticeSchema.index({ pinned: -1, publishAt: -1 });  // Pinned notices first
NoticeSchema.index({ audience: 1 });
NoticeSchema.index({ isActive: 1, publishAt: -1 });  // Active notices by publish date

// Method to mark notice as read
NoticeSchema.methods.markAsRead = function(userId) {
  const existingRead = this.readBy.find(r => r.userId.toString() === userId.toString());
  if (!existingRead) {
    this.readBy.push({ userId });
  }
  return this;
};

// Static method to get active notices for user
NoticeSchema.statics.getActiveNoticesForUser = async function(userId, userRoles) {
  const now = new Date();
  
  return this.find({
    isActive: true,
    publishAt: { $lte: now },
    expiresAt: { $gte: now },
    $or: [
      { audience: 'all' },
      { audience: { $in: userRoles } },
      { audience: { $regex: '^dept:', $options: 'i' } }  // Department-specific (if implemented)
    ]
  })
  .populate('createdBy', 'name email roles')
  .sort({ pinned: -1, publishAt: -1 })
  .limit(50);
};

// Pre-save hook to auto-set isActive based on dates
NoticeSchema.pre('save', function(next) {
  const now = new Date();
  if (this.publishAt > now || this.expiresAt < now) {
    this.isActive = false;
  } else {
    this.isActive = true;
  }
  next();
});

export default NoticeSchema;