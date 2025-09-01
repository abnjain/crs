import { Book, Loan } from "../models/index.js";

// add book
export const addBook = async (req, res, next) => {
  try {
    if (!req.body) return res.status(400).json({ error: "Valid book data required", message: "Title, author, and ISBN are required" });
    const { title, author, isbn } = req.body;
    if (!title || !author || !isbn) return res.status(400).json({ error: "All fields are required", message: "Title, author, and ISBN are required" });
    const book = await Book.create({ title, author, isbn });
    res.status(201).json({ book, message: "Book added successfully", ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Can't Add Book or Internal Server Error", error: err.message });
    next(err);
  }
};

// search books
export async function searchBooks(req, res, next) {
  try {
    const q = {};
    if (req.query.q) q.$text = { $search: req.query.q };
    if (req.query.author) q.authors = { $in: [req.query.author] };
    if (req.query.subject) q.subjects = { $in: [req.query.subject] };
    const list = await Book.find(q).limit(200);
    if (!list || list.length === 0) return res.status(404).json({ message: "No Books Found", error: "Not Found" });
    res.status(200).json({ list, message: "Books fetched successfully", ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error", error: "Something went wrong" });
    next(err);
  }
}

// issue book
export const issueBook = async (req, res, next) => {
  try {
    if (!req.body) return res.status(400).json({ error: "Valid book data required", message: "Book ID and User ID are required" });
    const { bookId, userId } = req.body;
    const book = await Book.findById(bookId);
    if (!book || book.copiesAvailable <= 0) return res.status(400).json({ error: "Not available", message: "Book not found or not available" });
    book.copiesAvailable -= 1;
    await book.save();
    const dueOn = new Date(Date.now() + 14*24*3600*1000); // 14 days
    const loan = await Loan.create({ bookId, userId, dueOn });
    res.status(201).json({ loan, message: "Book issued successfully", ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Can't issue book or Internal Server Error", error: err.message });
    next(err);
  }
};

// return book
export const returnBook = async (req, res, next) => {
  try {
    const { loanId } = req.body;
    const loan = await Loan.findById(loanId);
    if (!loan) return res.status(400).json({ error: "Loan not found", message: "No loan found with the given ID" });
    loan.returnedOn = new Date();
    // fine calc
    const overdueMs = loan.returnedOn - loan.dueOn;
    let fine = 0;
    if (overdueMs > 0) {
      const days = Math.ceil(overdueMs / (24*3600*1000));
      fine = days * 5; // ₹5/day
    }
    loan.fineAccrued = fine;
    await loan.save();
    const book = await Book.findById(loan.bookId);
    if (book) { book.copiesAvailable += 1; await book.save(); }
    res.status(200).json({ loan, fine, ok: true, message: fine > 0 ? `Book returned with a fine of ₹${fine}` : "Book returned successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Can't return book or Internal Server Error", error: err.message });
    next(err);
  }
};

export async function loansForStudent(req, res, next) {
  try {
    const list = await Loan.find({ userId: req.query.studentId }).populate("bookId");
    if (!list || list.length === 0) return res.status(404).json({ message: "No Loans Found", error: "Not Found" });
    res.status(200).json({ list, message: "Loans fetched successfully", ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error", error: "Something went wrong" });
    next(err);
  }
}

export async function finesForStudent(req, res, next) {
  try {
    const list = await Loan.find({ userId: req.query.studentId, fineAccrued: { $gt: 0 } });
    if (!list || list.length === 0) return res.status(404).json({ message: "No Fines Found", error: "Not Found" });
    res.status(200).json({ list, message: "Fines fetched successfully", ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error", error: "Something went wrong" });
    next(err);
  }
}