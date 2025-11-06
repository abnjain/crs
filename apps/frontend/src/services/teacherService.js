// src/schemas/teacherSchema.js
import api from "../config/api.js";

export const getTeacher = async () => {
  return await api.get("/teachers");
};

export const getTeacherById = async (teacherId) => {
  return await api.get(`/teachers/${teacherId}`);
};

export const createTeacher = async (teacherData) => {
  return await api.post("/teachers", teacherData);
};

// ✅ Upload study materials
export const uploadMaterial = async (formData) => {
  // formData should include { file, subjectId, description, etc. }
  return await api.post("/teachers/materials", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// ✅ Fetch upcoming classes for the logged-in teacher
export const getUpcomingClasses = async () => {
  return await api.get("/teachers/upcoming-classes");
};

// ✅ Fetch the subjects assigned to the logged-in teacher
export const getMySubjects = async () => {
  return await api.get("/teachers/my-subjects");
};
