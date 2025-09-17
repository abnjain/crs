import { Notice } from "../models/index.js";

export const createNotice = async (req, res, next) => {
  try {
    if (!req.body) return res.status(400).json({ message: "Valid notice data required", error: "Invalid Input" });
    const notices = await Notice.create({ ...req.body, createdBy: req.user._id, publishAt: new Date() });
    if (!notices) return res.status(400).json({ message: "Failed to create notice", error: "Invalid Input" });
    res.status(201).json({ notices, message: "Notice created successfully", ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Can't create notice or Internal Server Error", error: err.message });
    next(err);
  }
};

export const getNotices = async (req, res, next) => {
  try {
    const notices = await Notice.find().sort({ publishAt: -1 }).limit(50);
    if (!notices) return res.status(404).json({ message: "No notices found", error: "Not Found" });
    res.status(200).json({ notices, message: "Notices fetched successfully", ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Can't fetch notices or Internal Server Error", error: err.message });
    next(err);
  }
};

// import Notice from '../models/Notice.js';
// import { User } from '../models/index.js';

// export const createNotice = async (req, res) => {
//   try {
//     const { title, body, audience, publishAt, expiresAt, pinned, priority } = req.body;
//     const { user } = req;  // From auth middleware

//     const notice = new Notice({
//       title,
//       body,
//       audience: Array.isArray(audience) ? audience : [audience],
//       createdBy: user.id,
//       publishAt: new Date(publishAt),
//       expiresAt: new Date(expiresAt),
//       pinned: pinned || false,
//       priority: priority || 'medium'
//     });

//     await notice.save();

//     // Populate for response
//     const populatedNotice = await Notice.findById(notice._id)
//       .populate('createdBy', 'name email roles')
//       .lean();

//     // The change stream will automatically notify connected clients

//     res.status(201).json({
//       success: true,
//       message: 'Notice created successfully',
//       data: populatedNotice
//     });
//   } catch (error) {
//     console.error('Error creating notice:', error);
//     res.status(400).json({ error: error.message });
//   }
// };

// export const getActiveNotices = async (req, res) => {
//   try {
//     const { userId, roles } = req.query;
    
//     const notices = await Notice.getActiveNoticesForUser(userId, JSON.parse(roles));
    
//     res.json({
//       success: true,
//       count: notices.length,
//       data: notices
//     });
//   } catch (error) {
//     console.error('Error fetching notices:', error);
//     res.status(500).json({ error: error.message });
//   }
// };

// export const markNoticeAsRead = async (req, res) => {
//   try {
//     const { noticeId } = req.params;
//     const { user } = req;

//     const notice = await Notice.findById(noticeId);
//     if (!notice) {
//       return res.status(404).json({ error: 'Notice not found' });
//     }

//     notice.markAsRead(user.id);
//     await notice.save();

//     // Notify via change stream (optional)
//     io.to(`user:${user.id}`).emit('noticeRead', { noticeId, userId: user.id });

//     res.json({ success: true, message: 'Notice marked as read' });
//   } catch (error) {
//     console.error('Error marking notice as read:', error);
//     res.status(500).json({ error: error.message });
//   }
// };

// export const pinNotice = async (req, res) => {
//   try {
//     const { noticeId } = req.params;
//     const { pinned } = req.body;

//     const notice = await Notice.findByIdAndUpdate(
//       noticeId,
//       { pinned: pinned !== undefined ? pinned : !notice.pinned },
//       { new: true }
//     ).populate('createdBy', 'name');

//     // Change stream will handle real-time updates

//     res.json({
//       success: true,
//       message: `Notice ${notice.pinned ? 'pinned' : 'unpinned'}`,
//       data: notice
//     });
//   } catch (error) {
//     console.error('Error pinning notice:', error);
//     res.status(500).json({ error: error.message });
//   }
// };
