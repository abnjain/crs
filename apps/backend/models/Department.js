import mongoose from "mongoose";

const DepartmentSchema = new mongoose.Schema({
  code: { 
    type: String, 
    required: true, 
    unique: true 
  },
  name: { 
    type: String, 
    required: true 
  }
}, { timestamps: true });

export default DepartmentSchema;
