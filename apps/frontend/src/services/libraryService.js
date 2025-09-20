import api from '@/config/api';

const libraryService = {
  // Search books (public route, no role needed)
  searchBooks: async (query = '') => {
    const params = {};
    if (query) params.q = query;
    const res = await api.get('/library/books', { params });
    return res.data.books;
  },

  // Get teacher’s active loans
  getMyLoans: async () => {
    const res = await api.get('/library/loans');
    return res.data.loans;
  },

  // Get teacher’s fine summary
  getMyFines: async () => {
    const res = await api.get('/library/fines');
    return res.data;
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
};

export default libraryService;