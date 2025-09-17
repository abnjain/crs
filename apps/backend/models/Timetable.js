import mongoose from "mongoose";

const TimetableSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        index: true
    },
    semester: {
        type: Number,
        required: true,
        index: true
    },
    section: {
        type: String,
        required: true,
        index: true
    },
    week: [{
        day: {
            type: String, 
            enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        },
        slots: [{
            start: String,
            end: String,
            subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
            teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" }
        }]
    }],
    validFrom: {
        type: Date,
        required: true
    },
    validTo: {
        type: Date,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

export default TimetableSchema;
