import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    startDate: { 
        type: Date, 
        required: true 
    },
    endDate: {
        type: Date, 
        required: true 
    },
    photos: [{
        type: String
    }], // can store base64 or URL
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
}, { timestamps: true });

export default mongoose.model("Event", EventSchema);
