import mongoose from "mongoose";

const LoanSchema = new mongoose.Schema({
  bookId: { 
    type: mongoose.Schema.Types.ObjectId, ref: "Book" 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, ref: "User" 
  },
  issuedOn: { 
    type: Date, default: Date.now 
  },
  dueOn: { 
    type: Date 
  },
  returnedOn: { 
    type: Date 
  },
  fineAccrued: { 
    type: Number, default: 0 
  }
}, { timestamps: true });

export default LoanSchema;
