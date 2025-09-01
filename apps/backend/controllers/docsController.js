import {Document} from "../models/index.js";

export async function createDoc(req, res, next) {
  try {
    if (!req.body) return res.status(400).json({ error: "Valid document data required", message: "Title and content are required" });
    const { title, content } = req.body;
    if (!title || !content) return res.status(400).json({ error: "All fields are required", message: "Title and content are required" });
    const doc = await Document.create({ ...req.body, ownerId: req.user._id });
    if (!doc) return res.status(500).json({ message: "Failed to create document", error: "Not Created" });
    res.status(201).json({ doc, message: "Document created successfully", ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create document or Internal Server Error", error: err.message });
    next(err);
  }
}

export async function listDocs(req, res, next) {
  try {
    const q = {};
    if (req.query.q) q.$text = { $search: req.query.q };
    if (req.query.type) q.type = req.query.type;
    const list = await Document.find(q).limit(200);
    if (!list || list.length === 0) return res.status(404).json({ message: "No Documents Found", error: "Not Found" });
    res.status(200).json({ list, message: "Documents fetched successfully", ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch documents or Internal Server Error", error: err.message });
    next(err);
  }
}

export async function getDocSignedUrl(req, res, next) {
  try {
    // placeholder: return currentVersion.fileKey
    const doc = await Document.findById(req.params.docId);
    if (!doc) return res.status(404).json({ message: "Document not found", error: "Not Found" });
    res.status(200).json({ url: doc.currentVersion?.fileKey || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get document signed URL or Internal Server Error", error: err.message });
    next(err);
  }
}

export async function addVersion(req, res, next) {
  try {
    if (!req.body || !req.body.fileKey || !req.body.size) return res.status(400).json({ message: "fileKey and size are required", error: "Bad Request" });
    const { fileKey, size } = req.body;
    const doc = await Document.findById(req.params.docId);
    doc.versions = doc.versions || [];
    doc.versions.push({ fileKey, size, uploadedAt: new Date() });
    doc.currentVersion = { fileKey, size, uploadedAt: new Date() };
    await doc.save();
    res.status(200).json({ doc, message: "Document version added successfully", ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add document version or Internal Server Error", error: err.message });
    next(err);
  }
}

export async function patchVisibility(req, res, next) {
  try {
    if (!req.body || !req.body.visibility) return res.status(400).json({ message: "Visibility is required", error: "Bad Request" });
    const { visibility } = req.body;
    const doc = await Document.findByIdAndUpdate(req.params.docId, { visibility }, { new: true });
    if (!doc) return res.status(404).json({ message: "Document not found", error: "Not Found" });
    res.status(200).json({ doc, message: "Document visibility updated successfully", ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update document visibility or Internal Server Error", error: err.message });
    next(err);
  }
}
