import mongoose from "mongoose";

const LoanSchema = new mongoose.Schema({
  bookId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Book",
    index: true
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    index: true
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

function calculateFine(dueOn, returnedOn) {
  const oneDay = 24 * 60 * 60 * 1000;
  const lateDays = Math.max(0, Math.ceil((returnedOn - dueOn) / oneDay));
  const finePerDay = 1; // Assuming a fine of ₹1 per day
  return lateDays * finePerDay;
}

export default LoanSchema;
