import { Events } from "../models/index.js";

export const createEvent = async (req, res) => {
  try {
    const photos = req.files?.map(file => `data:${file.mimetype};base64,${file.buffer.toString('base64')}`) || [];
    const event = await Events.create({ ...req.body, photos, createdBy: req.user._id });
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const listEvents = async (req, res) => {
  try {
    const events = await Events.find().sort({ date: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getEvent = async (req, res) => {
  try {
    const event = await Events.findById(req.params.id);
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const photos = req.files?.map(file => `data:${file.mimetype};base64,${file.buffer.toString('base64')}`);
    const event = await Events.findByIdAndUpdate(req.params.id, { ...req.body, ...(photos?.length && { photos }) }, { new: true });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    await Events.findByIdAndDelete(req.params.id);
    res.json({ message: "Events deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
