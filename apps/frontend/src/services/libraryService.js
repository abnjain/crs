// src/services/libraryService.js
import api from '@/config/api.js';

const libraryService = {
  // Search books (public route, no role needed)
  searchBooks: async (query = '') => {
    const params = {};
    if (query) params.q = query;
    const res = await api.get('/library/books', { params });
    return res.data.books;
  },

  // Get book details by ID
  getBookById: async (bookId) => {
    const res = await api.get(`/library/books/${bookId}`);
    return res.data;
  },

  // Get teacher’s active loans
  getMyLoans: async () => {
    const res = await api.get('/library/loans');
    return res.data.loans || [];
  },

  // Get user's fine summary
  getMyFines: async () => {
    const res = await api.get('/library/fines');
    return res.data || { total: 0, overdue: 0 };
  },

  // Issue book (only Admin/Librarian — Teacher can only view)
  // We'll disable this for Teacher in UI, but keep method for completeness
  issueBook: async (bookId, userId) => {
    const res = await api.post(`/library/books/${bookId}/issue`, { userId });
    return res.data;
  },

  // Return book
  returnBook: async (bookId, userId) => {
    const res = await api.post(`/library/books/${bookId}/return`, { userId });
    return res.data;
  },

  // Add new book (Admin/Librarian only)
  addBook: async (bookData) => {
    const res = await api.post('/library/books', bookData);
    return res.data;
  },
  
  // Get all books (for management)
  getAllBooks: async () => {
    const res = await api.get('/library/books');
    return res.data.books || [];
  }
};

export default libraryService;