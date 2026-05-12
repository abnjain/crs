import { api } from './api';

export type BookCopyStatus = 'available' | 'loaned' | 'lost' | 'maintenance';
export type BookCopyCondition = 'new' | 'good' | 'fair' | 'poor';
export type LoanStatus = 'active' | 'overdue' | 'returned' | 'lost';
export type HoldStatus = 'active' | 'fulfilled' | 'canceled' | 'expired';
export type FeeStatus = 'applied' | 'waived' | 'paid';

export interface BookRecord {
  _id: string;
  isbn: string;
  title: string;
  subtitle?: string;
  authors: string[];
  publisher?: string;
  publishYear?: number;
  edition?: string;
  language?: string;
  categories: string[];
  description?: string;
  coverImage?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BookCopyRecord {
  _id: string;
  book: BookRecord | string;
  barcode?: string;
  status: BookCopyStatus;
  condition: BookCopyCondition;
  shelfLocation?: string;
  notes?: string;
  acquiredAt?: string;
  lastLoanedAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BorrowerRecord {
  _id: string;
  studentId: string;
  name: string;
  email?: string;
  department?: string;
  program?: string;
  batch?: string;
  phone?: string;
  externalRef?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoanRecord {
  _id: string;
  borrower: BorrowerRecord | string;
  book: BookRecord | string;
  copy: BookCopyRecord | string;
  issuedBy?: { _id: string; name?: string; email?: string } | string;
  loanDate: string;
  dueDate: string;
  returnedAt?: string;
  status: LoanStatus;
  renewalsCount: number;
  maxRenewals: number;
  penaltyAccrued: number;
  createdAt: string;
  updatedAt: string;
}

export interface HoldRecord {
  _id: string;
  borrower: BorrowerRecord | string;
  book: BookRecord | string;
  status: HoldStatus;
  placedAt: string;
  expiresAt?: string;
  fulfilledLoan?: LoanRecord | string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeeRecord {
  _id: string;
  borrower: BorrowerRecord | string;
  loan?: LoanRecord | string;
  amount: number;
  currency: string;
  reason: string;
  status: FeeStatus;
  appliedAt: string;
  waivedAt?: string;
  waivedBy?: { _id: string; name?: string; email?: string } | string;
  waiverReason?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface ListResponse<T> {
  success: boolean;
  count: number;
  [key: string]: T[] | boolean | number;
}

interface SingleResponse<T> {
  success: boolean;
  [key: string]: T | boolean;
}

export const libraryService = {
  books: {
    async getAll(): Promise<BookRecord[]> {
      const { data } = await api.get<ListResponse<BookRecord>>('/v1/books');
      return (data.books as BookRecord[]) ?? [];
    },

    async getById(id: string): Promise<BookRecord> {
      const { data } = await api.get<SingleResponse<BookRecord>>(`/v1/books/${id}`);
      return data.book as BookRecord;
    },

    async getByIsbn(isbn: string): Promise<BookRecord> {
      const { data } = await api.get<SingleResponse<BookRecord>>(
        `/v1/books/by-isbn/${encodeURIComponent(isbn)}`
      );
      return data.book as BookRecord;
    },

    async create(body: Record<string, unknown>): Promise<BookRecord> {
      const { data } = await api.post<SingleResponse<BookRecord>>('/v1/books', body);
      return data.book as BookRecord;
    },

    async update(id: string, body: Record<string, unknown>): Promise<BookRecord> {
      const { data } = await api.patch<SingleResponse<BookRecord>>(`/v1/books/${id}`, body);
      return data.book as BookRecord;
    },

    async remove(id: string): Promise<void> {
      await api.delete(`/v1/books/${id}`);
    },
  },

  copies: {
    async getAll(): Promise<BookCopyRecord[]> {
      const { data } = await api.get<ListResponse<BookCopyRecord>>('/v1/book-copies');
      return (data.copies as BookCopyRecord[]) ?? [];
    },

    async getById(id: string): Promise<BookCopyRecord> {
      const { data } = await api.get<SingleResponse<BookCopyRecord>>(`/v1/book-copies/${id}`);
      return data.copy as BookCopyRecord;
    },

    async create(body: Record<string, unknown>): Promise<BookCopyRecord> {
      const { data } = await api.post<SingleResponse<BookCopyRecord>>('/v1/book-copies', body);
      return data.copy as BookCopyRecord;
    },

    async update(id: string, body: Record<string, unknown>): Promise<BookCopyRecord> {
      const { data } = await api.patch<SingleResponse<BookCopyRecord>>(`/v1/book-copies/${id}`, body);
      return data.copy as BookCopyRecord;
    },

    async remove(id: string): Promise<void> {
      await api.delete(`/v1/book-copies/${id}`);
    },
  },

  borrowers: {
    async getAll(): Promise<BorrowerRecord[]> {
      const { data } = await api.get<ListResponse<BorrowerRecord>>('/v1/borrowers');
      return (data.borrowers as BorrowerRecord[]) ?? [];
    },

    async getById(id: string): Promise<BorrowerRecord> {
      const { data } = await api.get<SingleResponse<BorrowerRecord>>(`/v1/borrowers/${id}`);
      return data.borrower as BorrowerRecord;
    },

    async getByStudentId(studentId: string): Promise<BorrowerRecord> {
      const { data } = await api.get<SingleResponse<BorrowerRecord>>(
        `/v1/borrowers/by-student/${encodeURIComponent(studentId)}`
      );
      return data.borrower as BorrowerRecord;
    },

    async create(body: Record<string, unknown>): Promise<BorrowerRecord> {
      const { data } = await api.post<SingleResponse<BorrowerRecord>>('/v1/borrowers', body);
      return data.borrower as BorrowerRecord;
    },

    async update(id: string, body: Record<string, unknown>): Promise<BorrowerRecord> {
      const { data } = await api.patch<SingleResponse<BorrowerRecord>>(`/v1/borrowers/${id}`, body);
      return data.borrower as BorrowerRecord;
    },

    async remove(id: string): Promise<void> {
      await api.delete(`/v1/borrowers/${id}`);
    },
  },

  loans: {
    async getAll(): Promise<LoanRecord[]> {
      const { data } = await api.get<ListResponse<LoanRecord>>('/v1/loans');
      return (data.loans as LoanRecord[]) ?? [];
    },

    async getById(id: string): Promise<LoanRecord> {
      const { data } = await api.get<SingleResponse<LoanRecord>>(`/v1/loans/${id}`);
      return data.loan as LoanRecord;
    },

    async create(body: { borrowerId: string; copyId?: string; isbn?: string }): Promise<LoanRecord> {
      const { data } = await api.post<SingleResponse<LoanRecord>>('/v1/loans', body);
      return data.loan as LoanRecord;
    },

    async renew(id: string): Promise<LoanRecord> {
      const { data } = await api.patch<SingleResponse<LoanRecord>>(`/v1/loans/${id}/renew`, {});
      return data.loan as LoanRecord;
    },

    async returnLoan(id: string, returnedAt?: string): Promise<LoanRecord> {
      const { data } = await api.patch<SingleResponse<LoanRecord>>(`/v1/loans/${id}/return`,
        returnedAt ? { returnedAt } : {}
      );
      return data.loan as LoanRecord;
    },

    async remove(id: string): Promise<void> {
      await api.delete(`/v1/loans/${id}`);
    },
  },

  holds: {
    async getAll(): Promise<HoldRecord[]> {
      const { data } = await api.get<ListResponse<HoldRecord>>('/v1/holds');
      return (data.holds as HoldRecord[]) ?? [];
    },

    async getById(id: string): Promise<HoldRecord> {
      const { data } = await api.get<SingleResponse<HoldRecord>>(`/v1/holds/${id}`);
      return data.hold as HoldRecord;
    },

    async create(body: Record<string, unknown>): Promise<HoldRecord> {
      const { data } = await api.post<SingleResponse<HoldRecord>>('/v1/holds', body);
      return data.hold as HoldRecord;
    },

    async update(id: string, body: Record<string, unknown>): Promise<HoldRecord> {
      const { data } = await api.patch<SingleResponse<HoldRecord>>(`/v1/holds/${id}`, body);
      return data.hold as HoldRecord;
    },

    async remove(id: string): Promise<void> {
      await api.delete(`/v1/holds/${id}`);
    },
  },

  fees: {
    async getAll(): Promise<FeeRecord[]> {
      const { data } = await api.get<ListResponse<FeeRecord>>('/v1/fees');
      return (data.fees as FeeRecord[]) ?? [];
    },

    async getById(id: string): Promise<FeeRecord> {
      const { data } = await api.get<SingleResponse<FeeRecord>>(`/v1/fees/${id}`);
      return data.fee as FeeRecord;
    },

    async create(body: Record<string, unknown>): Promise<FeeRecord> {
      const { data } = await api.post<SingleResponse<FeeRecord>>('/v1/fees', body);
      return data.fee as FeeRecord;
    },

    async update(id: string, body: Record<string, unknown>): Promise<FeeRecord> {
      const { data } = await api.patch<SingleResponse<FeeRecord>>(`/v1/fees/${id}`, body);
      return data.fee as FeeRecord;
    },

    async waive(id: string, reason: string, waiverKey?: string): Promise<FeeRecord> {
      const headers = waiverKey ? { 'x-library-fee-waiver-key': waiverKey } : undefined;
      const { data } = await api.patch<SingleResponse<FeeRecord>>(
        `/v1/fees/${id}/waive`,
        { reason },
        headers ? { headers } : undefined
      );
      return data.fee as FeeRecord;
    },

    async remove(id: string): Promise<void> {
      await api.delete(`/v1/fees/${id}`);
    },
  },
};
