import { Events } from "../models/index.js";

export const createEvent = async (req, res) => {
  try {
    const data = req.body;
    const photos = req.files?.map(file =>
      `data:${file.mimetype};base64,${file.buffer.toString('base64')}`
    ) || [];

    const event = await Events.create({
      ...data,
      photos,
      createdBy: req.user._id,
    });
    return res.status(201).json({ event, message: "Event created successfully", ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message, message: "Error Creating Event" });
  }
};

export const listEvents = async (req, res) => {
  try {
    // ---- Pagination params 
    const page = Math.max(1, parseInt(req.query.page, 10)) || 1;   // current page
    const limit = 9;                                            // fixed 9 per page
    const skip = (page - 1) * limit;

    const total = await Events.countDocuments();

    const events = await Events.find()
      .sort({ startDate: -1 })   // newest first (you can change field)
      .skip(skip)
      .limit(limit)
      .lean();                   // faster, plain JS objects

    return res.status(200).json({ ok: true, message: "Events fetched successfully", events, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }, });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ ok: false, error: err.message, message: "Error Fetching Events" });
  }
};

export const getEvent = async (req, res) => {
  try {
    const event = await Events.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ ok: false, message: "Event not found" });
    }

    // Attach index to each photo for frontend reference
    const photosWithIndex = (event.photos || []).map((photo, index) => ({
      index,
      url: photo,
    }));

    return res.status(200).json({ ok: true, message: "Events fetched successfully", event: { ...event.toObject(), photos: photosWithIndex } });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message, message: "Error Finding Event" });
  }
};

export const updateEvent = async (req, res) => {
  try {
    let data = {};
    if (req.body.data) {
      try {
        data = JSON.parse(req.body.data);
      } catch (err) {
        console.error("Invalid JSON in req.body.data", err);
        return res.status(400).json({ ok: false, message: "Invalid request data", error: err.message });
      }
    } else {
      data = req.body;
    }

    const uploadedPhotos = req.files?.length
      ? req.files.map((file) =>
        `data:${file.mimetype};base64,${file.buffer.toString("base64")}`
      )
      : [];

    const event = await Events.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ ok: false, message: "Event not found" });
    }

    // ✅ Keep only photos that were NOT deleted
    const deletedIndexes = Array.isArray(data.deletedPhotoIndexes)
      ? data.deletedPhotoIndexes.map(Number)
      : [];

    const remainingPhotos = event.photos.filter((_, idx) => !deletedIndexes.includes(idx));
    const mergedPhotos = [...remainingPhotos, ...uploadedPhotos];
    const updateData = { ...data, photos: mergedPhotos };

    const updateEvent = await Events.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    return res.status(200).json({ ok: true, message: "Event Updated successfully", event: updateEvent });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message, message: "Error Updating Event" });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    await Events.findByIdAndDelete(req.params.id);
    return res.status(200).json({ ok: true, message: "Events deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message, message: "Error Deleting Event" });
  }
};
