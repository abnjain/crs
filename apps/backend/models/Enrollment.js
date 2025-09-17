import mongoose from "mongoose";

const EnrollmentSchema = new mongoose.Schema({ 
    studentId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Student" 
    }, 
    courseId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Course" 
    }, 
    semester: {
        type: Number,
        required: true
    }, 
    section: {
        type: String,
        required: true
    }, 
    subjects: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Subject" 
    }], 
    year: {
        type: Number,
        required: true
    }
}, { timestamps: true });

EnrollmentSchema.index({ studentId: 1, courseId: 1, semester: 1 }, { unique: true });

export default EnrollmentSchema;
