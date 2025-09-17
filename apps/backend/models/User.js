import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        index: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: false,
        unique: true,
        index: true,
        maxlength: 10,
        minlength: 10,
        match: [/^\d{10}$/, 'Please fill a valid 10 digit phone number']
    },
    roles: [{
        type: String,
        enum: ["Student", "Teacher", "Staff", "Librarian", "Placement", "Admin", "SuperAdmin"],
        default: "Student"
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    resetToken: {
        type: String,
        default: null
    },
    resetTokenExp: {
        type: Date,
        default: null
    },
    tokenVersion: { 
        type: Number, 
        default: 0, 
        index: true 
    },
    lastRevocation: { 
        type: Date, 
        default: null 
    }, // Global revocation timestamp
},
    { timestamps: true }
);

export default UserSchema;
