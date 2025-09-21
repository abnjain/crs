// src/services/alumniService.js
import api from "@/config/api";

const BASE = "/alumni";

const alumniService = {
  // List alumni with optional params (e.g., search)
  list: async (params = {}) => {
    try {
      const res = await api.get(BASE, { params });
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to fetch alumni list");
    }
  },
  // Get single alumnus
  get: async (id) => {
    try {
      const res = await api.get(`${BASE}/${id}`);
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to fetch alumnus");
    }
  },
  // Create new alumnus
  create: async (payload) => {
    try {
      const res = await api.post(BASE, payload);
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to create alumnus");
    }
  },
  // Update alumnus
  update: async (id, payload) => {
    try {
      const res = await api.patch(`${BASE}/${id}`, payload);
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to update alumnus");
    }
  },
  // Delete alumnus
  remove: async (id) => {
    try {
      const res = await api.delete(`${BASE}/${id}`);
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to delete alumnus");
    }
  },
  // Message alumni (single or multiple)
  message: async (payload) => { // payload: { ids: [id1, id2], message: "text" }
    try {
      const res = await api.post(`${BASE}/message`, payload);
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to send message");
    }
  },
  // Bulk upload via excel
  uploadExcel: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await api.post(`${BASE}/upload/excel`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to upload excel");
    }
  },
};

export default alumniService;