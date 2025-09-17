import mongoose from "mongoose";

const MarkSchema = new mongoose.Schema({
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Exam",
    required: true,
    index: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
    index: true
  },
  marksObtained: {
    type: Number,
    required: true,
    min: 0
  },
  maxMarks: {
    type: Number,
    required: true,
    min: 1
  },
  percentage: {
    type: Number,
    min: 0,
    max: 100
  },
  grade: {
    type: String,
    enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F']
  },
  enteredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Teacher",
    required: true
  },
  remarks: {
    type: String,
    maxlength: 500
  }
}, { timestamps: true });

MarkSchema.index({ examId: 1, studentId: 1 }, { unique: true });
MarkSchema.index({ studentId: 1, createdAt: -1 }); // For student marks history
MarkSchema.index({ enteredBy: 1, createdAt: -1 }); // For teacher activity

// Pre-save middleware for validation and calculation
MarkSchema.pre('save', async function (next) {
  try {
    // Ensure marksObtained doesn't exceed maxMarks
    if (this.marksObtained > this.maxMarks) {
      return next(new Error(`Marks obtained (${this.marksObtained}) cannot exceed max marks (${this.maxMarks})`));
    }

    if (this.marksObtained < 0) {
      return next(new Error('Marks obtained cannot be negative'));
    }

    // Calculate percentage
    this.percentage = Math.round((this.marksObtained / this.maxMarks) * 100);

    // Auto-calculate grade based on percentage
    if (!this.grade) {
      if (this.percentage >= 90) this.grade = 'A+';
      else if (this.percentage >= 80) this.grade = 'A';
      else if (this.percentage >= 70) this.grade = 'B+';
      else if (this.percentage >= 60) this.grade = 'B';
      else if (this.percentage >= 50) this.grade = 'C';
      else if (this.percentage >= 40) this.grade = 'D';
      else this.grade = 'F';
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Static method to create marks with exam validation
MarkSchema.statics.createWithExamValidation = async function (examId, studentId, marksObtained, enteredBy, remarks = '') {
  const Exam = mongoose.model('Exam');

  // Fetch exam to get maxMarks
  const exam = await Exam.findById(examId).populate('subjectId');
  if (!exam) {
    throw new Error('Exam not found');
  }

  // Validate marks against exam maxMarks
  if (marksObtained > exam.maxMarks) {
    throw new Error(`Marks obtained (${marksObtained}) cannot exceed exam max marks (${exam.maxMarks})`);
  }

  // Create marks document
  const marks = new this({
    examId,
    studentId,
    marksObtained,
    maxMarks: exam.maxMarks, // Store maxMarks in marks for quick access
    enteredBy,
    remarks
  });

  await marks.save();
  return marks;
};

// Method to get student marks summary
MarkSchema.statics.getStudentMarksSummary = async function (studentId, semester, year) {
  return this.aggregate([
    {
      $match: {
        studentId: new mongoose.Types.ObjectId(studentId),
        semester: semester, // Assuming exam has semester, or derive from subject
        year: year
      }
    },
    {
      $lookup: {
        from: 'exams',
        localField: 'examId',
        foreignField: '_id',
        as: 'exam'
      }
    },
    {
      $unwind: '$exam'
    },
    {
      $lookup: {
        from: 'subjects',
        localField: 'exam.subjectId',
        foreignField: '_id',
        as: 'subject'
      }
    },
    {
      $unwind: { path: '$subject', preserveNullAndEmptyArrays: true }
    },
    {
      $group: {
        _id: '$subject._id',
        subjectName: { $first: '$subject.name' },
        totalMarks: { $sum: '$marksObtained' },
        totalMaxMarks: { $sum: '$maxMarks' },
        exams: {
          $push: {
            examName: '$exam.name',
            marks: '$marksObtained',
            max: '$maxMarks',
            grade: '$grade',
            percentage: '$percentage'
          }
        },
        count: { $sum: 1 }
      }
    },
    {
      $addFields: {
        subjectPercentage: {
          $round: [{ $multiply: [{ $divide: ['$totalMarks', '$totalMaxMarks'] }, 100] }, 2]
        },
        overallGrade: {
          $switch: {
            branches: [
              { case: { $gte: ['$subjectPercentage', 90] }, then: 'A+' },
              { case: { $and: [{ $gte: ['$subjectPercentage', 80] }, { $lt: ['$subjectPercentage', 90] }] }, then: 'A' },
              { case: { $and: [{ $gte: ['$subjectPercentage', 70] }, { $lt: ['$subjectPercentage', 80] }] }, then: 'B+' },
              { case: { $and: [{ $gte: ['$subjectPercentage', 60] }, { $lt: ['$subjectPercentage', 70] }] }, then: 'B' },
              { case: { $and: [{ $gte: ['$subjectPercentage', 50] }, { $lt: ['$subjectPercentage', 60] }] }, then: 'C' },
              { case: { $lt: ['$subjectPercentage', 50] }, then: 'F' }
            ],
            default: 'N/A'
          }
        }
      }
    },
    {
      $sort: { subjectPercentage: -1 }
    }
  ]);
};

// Virtual for full details
MarkSchema.virtual('examDetails', {
  ref: 'Exam',
  localField: 'examId',
  foreignField: '_id',
  justOne: true
});

MarkSchema.virtual('studentDetails', {
  ref: 'Student',
  localField: 'studentId',
  foreignField: '_id',
  justOne: true
});

MarkSchema.set('toJSON', { virtuals: true });
MarkSchema.set('toObject', { virtuals: true });

export default MarkSchema;