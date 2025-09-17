import mongoose from "mongoose";

const BookSchema = new mongoose.Schema({
  isbn: { 
    type: String, 
    index: true, 
    unique: true
  },
  title: { 
    type: String,
    required: true, 
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
    min: 0,
    // max: [this.copiesTotal, 'Cannot exceed total copies'], 
    default: 1 
  },
  tags: [{ 
    type: String 
  }]
}, { timestamps: true });

// Custom validator for copiesAvailable using pre-save middleware
BookSchema.pre('validate', function(next) {
  if (this.copiesAvailable > this.copiesTotal) {
    this.invalidate('copiesAvailable', 'Cannot exceed total copies');
  }
  
  // Ensure copiesAvailable is not negative
  if (this.copiesAvailable < 0) {
    this.invalidate('copiesAvailable', 'Copies available cannot be negative');
  }
  
  next();
});

// Method to update copies available (e.g., when book is issued/returned)
BookSchema.methods.updateAvailability = function(action, quantity = 1) {
  if (action === 'issue') {
    if (this.copiesAvailable >= quantity) {
      this.copiesAvailable -= quantity;
      return true;
    }
    return false; // Not enough copies
  } else if (action === 'return') {
    this.copiesAvailable = Math.min(this.copiesTotal, this.copiesAvailable + quantity);
    return true;
  }
  return false;
};

// Static method to find available books
BookSchema.statics.findAvailableBooks = function(query = {}) {
  return this.find({
    ...query,
    copiesAvailable: { $gt: 0 }
  }).sort({ title: 1 });
};

// Index for efficient searches
BookSchema.index({ title: 'text', authors: 'text', subjects: 'text' });
BookSchema.index({ year: 1, publisher: 1 });

export default BookSchema;
