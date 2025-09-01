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

export default EnrollmentSchema;
