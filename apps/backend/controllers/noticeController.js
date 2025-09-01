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
