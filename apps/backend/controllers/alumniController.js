// apps/backend/controllers/alumniController.js
import mongoose from "mongoose";
import { Alumnus } from "../models/index.js";
import xlsx from "xlsx"; // used by excel upload helper
import { Readable } from "stream";

// CRUD + search + bulk upload + messaging (simple)

export const createAlumnus = async (req, res, next) => {
  try {
    const payload = req.body;
    payload.createdBy = req.user?._id;
    const alumnus = await mongoose.models.Alumnus.create(payload);
    res.status(201).json({ ok: true, alumnus });
  } catch (err) { next(err); }
};

export const getAlumnus = async (req, res, next) => {
  try {
    const alumnus = await mongoose.models.Alumnus.findById(req.params.id);
    if (!alumnus) return res.status(404).json({ ok: false, message: "Not found" });
    res.json({ ok: true, alumnus });
  } catch (err) { next(err); }
};

export const updateAlumnus = async (req, res, next) => {
  try {
    const updated = await mongoose.models.Alumnus.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ ok: true, alumnus: updated });
  } catch (err) { next(err); }
};

export const deleteAlumnus = async (req, res, next) => {
  try {
    await mongoose.models.Alumnus.findByIdAndDelete(req.params.id);
    res.json({ ok: true, message: "Deleted" });
  } catch (err) { next(err); }
};

export const listAlumni = async (req, res, next) => {
  try {
    const { q, batch, department, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (batch) filter.batch = batch;
    if (department) filter.department = department;

    if (q) {
      filter.$text = { $search: q };
    }

    const skip = (Math.max(1, page) - 1) * limit;
    const total = await mongoose.models.Alumnus.countDocuments(filter);
    const alumni = await mongoose.models.Alumnus.find(filter).skip(skip).limit(Number(limit)).sort({ createdAt: -1 });
    res.json({ ok: true, alumni, total });
  } catch (err) { next(err); }
};

// Simple message placeholder (store messages in DB or integrate with mail later)
export const messageAlumni = async (req, res, next) => {
  try {
    const { alumniIds = [], subject, body } = req.body;
    // naive: save message to DB or send email — for now, just respond with what would be sent
    // recommend: later wire to nodemailer or internal messaging collection
    res.json({ ok: true, sentTo: alumniIds.length, subject });
  } catch (err) { next(err); }
};

// Bulk upload via excel (multipart/form-data with file field 'file')
export const uploadAlumniExcel = async (req, res, next) => {
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
        const saved = await mongoose.models.Alumnus.create(doc);
        created.push(saved);
      } catch (errRow) {
        // skip row on error
      }
    }

    res.json({ ok: true, created: created.length });
  } catch (err) { next(err); }
};
