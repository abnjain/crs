import mongoose from "mongoose";
import ApplicationSchema from "./Application.js";
import AttendanceSchema from "./Attendance.js";
import BookSchema from "./Book.js";
import CourseSchema from "./Course.js";
import DepartmentSchema from "./Department.js";
import DocumentSchema from "./Document.js";
import EnrollmentSchema from "./Enrollment.js"
import ExamSchema from "./Exam.js";
import JobSchema from "./Job.js";
import LoanSchema from "./Loan.js";
import MarkSchema from "./Marks.js";
import MaterialSchema from "./Material.js";
import NoticeSchema from "./Notice.js";
import StudentSchema from "./Student.js";
import SubjectSchema from "./Subject.js";
import TeacherSchema from "./Teacher.js";
import TimetableSchema from "./Timetable.js";
import UserSchema from "./User.js";
import { seedDB } from "../config/seedDb.js";

// Utility to safely register models
const registerModel = (name, schema) => {
  return mongoose.models[name] || mongoose.model(name, schema);
};

// Register all models here
const User = registerModel("User", UserSchema);
const Application = registerModel("Application", ApplicationSchema);
const Attendance = registerModel("Attendance", AttendanceSchema);
const Book = registerModel("Book", BookSchema);
const Course = registerModel("Course", CourseSchema);
const Department = registerModel("Department", DepartmentSchema);
const Document = registerModel("Document", DocumentSchema);
const Enrollment = registerModel("Enrollment", EnrollmentSchema);
const Exam = registerModel("Exam", ExamSchema);
const Job = registerModel("Job", JobSchema);
const Loan = registerModel("Loan", LoanSchema);
const Marks = registerModel("Marks", MarkSchema);
const Material = registerModel("Material", MaterialSchema);
const Notice = registerModel("Notice", NoticeSchema);
const Student = registerModel("Student", StudentSchema);
const Timetable = registerModel("Timetable", TimetableSchema);
const Subject = registerModel("Subject", SubjectSchema);
const Teacher = registerModel("Teacher", TeacherSchema);

export { User, Application, Attendance, Book, Course, Department, Document, Enrollment, Exam, Job, Loan, Marks, Material, Notice, Student, Subject, Teacher, Timetable };

// seedDB();