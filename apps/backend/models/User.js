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
            required: true 
        },
        name: { 
            type: String 
        },
        phone: { 
            type: String,
            required: false,
            unique: true,
            index: true
        },
        roles: { 
            type: String, 
            enum: ["Student","Teacher","Staff","Librarian","Placement"], 
            default: "Student" 
        },
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
    }, 
    { timestamps: true }
);

export default UserSchema;
