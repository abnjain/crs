import mongoose from "mongoose";

const TimetableSchema = new mongoose.Schema({ 
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
    week: { 
        type: mongoose.Schema.Types.Mixed, 
        required: true 
    }, 
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
