// apps/backend/controllers/alumniController.js
import mongoose from "mongoose";
import { Alumnus } from "../models/index.js";
import xlsx from "xlsx"; // used by excel upload helper

// CRUD + search + bulk upload + messaging (simple)

export const createAlumnus = async (req, res) => {
  try {
    const payload = req.body;
    if (!payload) return res.status(400).json({ ok: false, message: "Invalid payload" });
    if (!req.user) return res.status(400).json({ ok: false, message: "Invalid user" });
    payload.createdBy = req.user?._id;
    // optional: validate base64 image length or URL format
    if (payload.profilePhoto && typeof payload.profilePhoto !== "string") {
      return res.status(400).json({ ok: false, message: "Invalid profile photo" });
    }
    const alumnus = await Alumnus.create(payload);
    return res.status(201).json({ ok: true, message: "Alumni created successfully", alumnus: { name: alumnus.name, email: alumnus.email, createdBy: req.user?._id } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: "Can't Create Alumni", error: err.message });
  }
};

export const getAlumnus = async (req, res) => {
  try {
    const alumni = await Alumnus.findOne({ _id: req.params.id });
    if (!alumni) return res.status(404).json({ ok: false, message: "Not found" });
    return res.status(200).json({ ok: true, message: "Alumni details fetched successfully", alumni });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: "Internal Server Error", error: err.message });
  }
};

export const updateAlumnus = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const file = req.file;
    if (file) {
      // Convert uploaded file to base64 (or save to disk/cloud and set URL)
      payload.profilePhoto = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
    } else if (payload.profilePhoto && !payload.profilePhoto.startsWith("data:image/") && !payload.profilePhoto.startsWith("http")) {
      return res.status(400).json({ ok: false, message: "Invalid profile photo format" });
    }
    const updated = await Alumnus.findByIdAndUpdate(id, payload, { new: true });
    if (!updated) {
      return res.status(404).json({ ok: false, message: "Alumni not found" });
    }
    const user = req.file ? await Alumnus.findByIdAndUpdate(id, { profilePhoto: payload.profilePhoto }, { new: true }) : null;
    if (!user) return res.status(404).json({ ok: false, message: "User not found or Profile Photo not updated." });
    return res.status(200).json({ ok: true, message: "Alumni updated successfully", alumnus: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: "Can't Update Alumni", error: err.message });
  }
};

export const deleteAlumnus = async (req, res) => {
  try {
    await Alumnus.findByIdAndDelete(req.params.id);
    return res.status(200).json({ ok: true, message: "Alumni Deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: "Can't Delete Alumni", error: err.message });
  }
};

export const listAlumni = async (req, res) => {
  try {
    const { q, batch, department, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (batch) filter.batch = batch;
    if (department) filter.department = department;

    if (q) {
      filter.$text = { $search: q };
    }

    const skip = (Math.max(1, page) - 1) * limit;
    const total = await Alumnus.countDocuments(filter);
    const alumnus = await Alumnus.find(filter).skip(skip).limit(Number(limit)).sort({ createdAt: -1 });
    return res.status(200).json({ ok: true, message: "Alumnus fetched successfully", alumnus, total });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: "Internal Server Error", error: err.message });
  }
};

// Simple message placeholder (store messages in DB or integrate with mail later)
export const messageAlumni = async (req, res) => {
  try {
    const { alumniIds = [], subject, body } = req.body;
    // naive: save message to DB or send email — for now, just respond with what would be sent
    // recommend: later wire to nodemailer or internal messaging collection
    return res.status(200).json({ ok: true, sentTo: alumniIds.length, subject });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: "Internal Server Error", error: err.message });
  }
};

// Bulk upload via excel (multipart/form-data with file field 'file')
export const uploadAlumniExcel = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ ok: false, message: "No file" });
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet, { defval: "" });

    // Expected columns: name, email, phone, enrollmentNo, batch, department, degree, graduationYear, currentCompany, currentRole, linkedin
    const created = [];
    for (const row of rows) {
      try {
        const doc = {
          name: row.name || row.Name || "",
          email: row.email || row.Email || "",
          phone: row.phone || row.Phone || "",
          enrollmentNo: row.enrollmentNo || row.EnrollmentNo || "",
          batch: row.batch || row.Batch || "",
          department: row.department || row.Department || "",
          degree: row.degree || row.Degree || "",
          graduationYear: row.graduationYear || row.GraduationYear || null,
          currentCompany: row.currentCompany || row.CurrentCompany || "",
          currentRole: row.currentRole || row.CurrentRole || "",
          linkedin: row.linkedin || "",
          createdBy: req.user?._id,
        };
        const saved = await Alumnus.create(doc);
        created.push(saved);
      } catch (errRow) {
        // skip row on error
      }
    }

    return res.status(200).json({ ok: true, created: created.length });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: "Internal Server Error", error: err.message });
  }
};
