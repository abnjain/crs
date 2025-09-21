// apps/backend/models/Alumnus.js
import mongoose from "mongoose";

const WorkExperienceSchema = new mongoose.Schema({
    company: {
        type: String
    },
    role: {
        type: String
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    currentlyWorking: {
        type: Boolean,
        default: false
    },
    description: {
        type: String
    },
});

const AlumnusSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        index: true
    },
    email: {
        type: String,
        index: true
    },
    phone: {
        type: String,
        index: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true,
        unique: true
    },
    enrollmentNo: {
        type: String,
        index: true,
        unique: false
    },
    batch: {
        type: String,
        index: true
    },
    department: {
        type: String,
        index: true
    },
    degree: {
        type: String
    },
    specialization: {
        type: String
    },
    graduationYear: {
        type: Number
    },
    currentCompany: {
        type: String
    },
    currentRole: {
        type: String
    },
    linkedin: {
        type: String
    },
    location: {
        type: String
    },
    about: {
        type: String
    },
    experiences: [WorkExperienceSchema],
    tags: [{
        type: String
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    visibility: {
        type: String,
        enum: ["public", "private"],
        default: "public"
    }
}, { timestamps: true });

// Index for search
AlumnusSchema.index({
    name: 'text',
    email: 'text',
    currentCompany: 'text',
    currentRole: 'text',
    department: 'text',
    tags: 'text'
});

export default AlumnusSchema;
