import mongoose from "mongoose";

const BookSchema = new mongoose.Schema({
  isbn: { 
    type: String, index: true 
  },
  title: { 
    type: String 
  },
  authors: [{ 
    type: String 
  }],
  subjects: [{ 
    type: String 
  }],
  publisher: { 
    type: String 
  },
  year: { 
    type: Number 
  },
  copiesTotal: { 
    type: Number, 
    default: 1 
  },
  copiesAvailable: { 
    type: Number, 
    default: 1 
  },
  tags: [{ 
    type: String 
  }]
}, { timestamps: true });

export default BookSchema;
