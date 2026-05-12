import { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { DashboardShell } from '../../components/dashboard/DashboardShell';
import { DataListing } from '../../components/common/DataListing';
import type { ListingColumn } from '../../components/common/DataListing';
import { Dialog } from '../../components/common/Dialog';
import {
  libraryService,
  type BookRecord,
  type BookCopyRecord,
  type BorrowerRecord,
  type LoanRecord,
  type HoldRecord,
  type FeeRecord,
  type BookCopyCondition,
  type BookCopyStatus,
  type HoldStatus,
  type FeeStatus,
} from '../../services/library.service';

const TABS = [
  { id: 'lend', label: 'Lend / Return' },
  { id: 'catalog', label: 'Catalog' },
  { id: 'copies', label: 'Book Copies' },
  { id: 'borrowers', label: 'Borrowers' },
  { id: 'loans', label: 'Loans' },
  { id: 'holds', label: 'Holds' },
  { id: 'fees', label: 'Fees' },
] as const;

type TabId = (typeof TABS)[number]['id'];

type SerialPortLike = {
  readable: ReadableStream<Uint8Array> | null;
  open: (options: { baudRate: number }) => Promise<void>;
  close: () => Promise<void>;
};

type SerialLike = {
  requestPort: () => Promise<SerialPortLike>;
  addEventListener?: (type: 'disconnect', listener: (event: unknown) => void) => void;
};

type BookFormState = {
  isbn: string;
  title: string;
  subtitle: string;
  authors: string;
  publisher: string;
  publishYear: string;
  edition: string;
  language: string;
  categories: string;
  description: string;
  coverImage: string;
  isActive: boolean;
};

type CopyFormState = {
  bookId: string;
  barcode: string;
  status: BookCopyStatus;
  condition: BookCopyCondition;
  shelfLocation: string;
  notes: string;
  acquiredAt: string;
  isActive: boolean;
};

type BorrowerFormState = {
  studentId: string;
  name: string;
  email: string;
  department: string;
  program: string;
  batch: string;
  phone: string;
  externalRef: string;
  notes: string;
  isActive: boolean;
};

type HoldFormState = {
  borrowerId: string;
  bookId: string;
  status: HoldStatus;
  placedAt: string;
  expiresAt: string;
  notes: string;
};

type FeeFormState = {
  borrowerId: string;
  loanId: string;
  amount: string;
  currency: string;
  reason: string;
  status: FeeStatus;
};

const defaultBookForm = (): BookFormState => ({
  isbn: '',
  title: '',
  subtitle: '',
  authors: '',
  publisher: '',
  publishYear: '',
  edition: '',
  language: '',
  categories: '',
  description: '',
  coverImage: '',
  isActive: true,
});

const defaultCopyForm = (): CopyFormState => ({
  bookId: '',
  barcode: '',
  status: 'available',
  condition: 'good',
  shelfLocation: '',
  notes: '',
  acquiredAt: '',
  isActive: true,
});

const defaultBorrowerForm = (): BorrowerFormState => ({
  studentId: '',
  name: '',
  email: '',
  department: '',
  program: '',
  batch: '',
  phone: '',
  externalRef: '',
  notes: '',
  isActive: true,
});

const defaultHoldForm = (): HoldFormState => ({
  borrowerId: '',
  bookId: '',
  status: 'active',
  placedAt: '',
  expiresAt: '',
  notes: '',
});

const defaultFeeForm = (): FeeFormState => ({
  borrowerId: '',
  loanId: '',
  amount: '',
  currency: 'INR',
  reason: '',
  status: 'applied',
});

function parseCsv(value: string): string[] {
  return value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

function joinCsv(values?: string[]): string {
  return values?.join(', ') ?? '';
}

function toLocalDateTime(value?: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

function toIso(value: string): string | undefined {
  if (!value.trim()) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

function bookLabel(book?: BookRecord | string | null): string {
  if (!book) return '-';
  if (typeof book === 'string') return book;
  return `${book.title} (${book.isbn})`;
}

function borrowerLabel(borrower?: BorrowerRecord | string | null): string {
  if (!borrower) return '-';
  if (typeof borrower === 'string') return borrower;
  return `${borrower.name} (${borrower.studentId})`;
}

function copyLabel(copy?: BookCopyRecord | string | null): string {
  if (!copy) return '-';
  if (typeof copy === 'string') return copy;
  return copy.barcode || copy._id;
}

export function LibraryDashboardPage() {
  const [tab, setTab] = useState<TabId>('lend');

  const [books, setBooks] = useState<BookRecord[]>([]);
  const [copies, setCopies] = useState<BookCopyRecord[]>([]);
  const [borrowers, setBorrowers] = useState<BorrowerRecord[]>([]);
  const [loans, setLoans] = useState<LoanRecord[]>([]);
  const [holds, setHolds] = useState<HoldRecord[]>([]);
  const [fees, setFees] = useState<FeeRecord[]>([]);

  const [loading, setLoading] = useState({
    books: false,
    copies: false,
    borrowers: false,
    loans: false,
    holds: false,
    fees: false,
  });

  const [bookFormOpen, setBookFormOpen] = useState(false);
  const [copyFormOpen, setCopyFormOpen] = useState(false);
  const [borrowerFormOpen, setBorrowerFormOpen] = useState(false);
  const [holdFormOpen, setHoldFormOpen] = useState(false);
  const [feeFormOpen, setFeeFormOpen] = useState(false);

  const [editingBook, setEditingBook] = useState<BookRecord | null>(null);
  const [editingCopy, setEditingCopy] = useState<BookCopyRecord | null>(null);
  const [editingBorrower, setEditingBorrower] = useState<BorrowerRecord | null>(null);
  const [editingHold, setEditingHold] = useState<HoldRecord | null>(null);
  const [editingFee, setEditingFee] = useState<FeeRecord | null>(null);

  const [bookForm, setBookForm] = useState<BookFormState>(defaultBookForm());
  const [copyForm, setCopyForm] = useState<CopyFormState>(defaultCopyForm());
  const [borrowerForm, setBorrowerForm] = useState<BorrowerFormState>(defaultBorrowerForm());
  const [holdForm, setHoldForm] = useState<HoldFormState>(defaultHoldForm());
  const [feeForm, setFeeForm] = useState<FeeFormState>(defaultFeeForm());

  const [studentId, setStudentId] = useState('');
  const [isbn, setIsbn] = useState('');
  const [loanId, setLoanId] = useState('');
  const [scanTarget, setScanTarget] = useState<'student' | 'isbn'>('student');
  const [borrowerLookup, setBorrowerLookup] = useState<BorrowerRecord | null>(null);
  const [bookLookup, setBookLookup] = useState<BookRecord | null>(null);

  const [scannerStatus, setScannerStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [scannerError, setScannerError] = useState('');
  const portRef = useRef<SerialPortLike | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<string> | null>(null);
  const stopRef = useRef(false);

  const serial = (typeof navigator !== 'undefined'
    ? (navigator as Navigator & { serial?: SerialLike }).serial
    : undefined) as SerialLike | undefined;

  async function loadBooks() {
    setLoading((prev) => ({ ...prev, books: true }));
    try {
      const data = await libraryService.books.getAll();
      setBooks(data);
    } catch {
      toast.error('Failed to load books');
    } finally {
      setLoading((prev) => ({ ...prev, books: false }));
    }
  }

  async function loadCopies() {
    setLoading((prev) => ({ ...prev, copies: true }));
    try {
      const data = await libraryService.copies.getAll();
      setCopies(data);
    } catch {
      toast.error('Failed to load copies');
    } finally {
      setLoading((prev) => ({ ...prev, copies: false }));
    }
  }

  async function loadBorrowers() {
    setLoading((prev) => ({ ...prev, borrowers: true }));
    try {
      const data = await libraryService.borrowers.getAll();
      setBorrowers(data);
    } catch {
      toast.error('Failed to load borrowers');
    } finally {
      setLoading((prev) => ({ ...prev, borrowers: false }));
    }
  }

  async function loadLoans() {
    setLoading((prev) => ({ ...prev, loans: true }));
    try {
      const data = await libraryService.loans.getAll();
      setLoans(data);
    } catch {
      toast.error('Failed to load loans');
    } finally {
      setLoading((prev) => ({ ...prev, loans: false }));
    }
  }

  async function loadHolds() {
    setLoading((prev) => ({ ...prev, holds: true }));
    try {
      const data = await libraryService.holds.getAll();
      setHolds(data);
    } catch {
      toast.error('Failed to load holds');
    } finally {
      setLoading((prev) => ({ ...prev, holds: false }));
    }
  }

  async function loadFees() {
    setLoading((prev) => ({ ...prev, fees: true }));
    try {
      const data = await libraryService.fees.getAll();
      setFees(data);
    } catch {
      toast.error('Failed to load fees');
    } finally {
      setLoading((prev) => ({ ...prev, fees: false }));
    }
  }

  useEffect(() => {
    if (tab === 'catalog') void loadBooks();
    if (tab === 'copies') {
      void loadCopies();
      void loadBooks();
    }
    if (tab === 'borrowers') void loadBorrowers();
    if (tab === 'loans' || tab === 'lend') {
      void loadLoans();
    }
    if (tab === 'holds') {
      void loadHolds();
      void loadBorrowers();
      void loadBooks();
    }
    if (tab === 'fees') {
      void loadFees();
      void loadBorrowers();
      void loadLoans();
    }
  }, [tab]);

  useEffect(() => {
    if (!serial?.addEventListener) return;
    const onDisconnect = () => {
      setScannerStatus('idle');
      setScannerError('');
    };
    serial.addEventListener('disconnect', onDisconnect);
  }, [serial]);

  useEffect(() => {
    return () => {
      void disconnectScanner();
    };
  }, []);

  async function connectScanner() {
    if (!serial) {
      toast.error('WebSerial is not supported in this browser');
      return;
    }
    setScannerStatus('connecting');
    setScannerError('');
    try {
      const port = await serial.requestPort();
      await port.open({ baudRate: 9600 });
      portRef.current = port;
      stopRef.current = false;
      setScannerStatus('connected');
      void startReadLoop(port);
    } catch (err: unknown) {
      setScannerStatus('error');
      setScannerError((err as Error)?.message ?? 'Failed to connect');
    }
  }

  async function disconnectScanner() {
    stopRef.current = true;
    if (readerRef.current) {
      try {
        await readerRef.current.cancel();
      } catch {
        /* ignore */
      }
      readerRef.current = null;
    }
    if (portRef.current) {
      try {
        await portRef.current.close();
      } catch {
        /* ignore */
      }
      portRef.current = null;
    }
    setScannerStatus('idle');
  }

  async function startReadLoop(port: SerialPortLike) {
    if (!port.readable) return;
    const decoder = new TextDecoderStream();
    const readableClosed = port.readable.pipeTo(decoder.writable);
    const reader = decoder.readable.getReader();
    readerRef.current = reader;

    let buffer = '';
    try {
      while (!stopRef.current) {
        const { value, done } = await reader.read();
        if (done) break;
        if (!value) continue;
        buffer += value;
        const parts = buffer.split(/\r?\n/);
        buffer = parts.pop() ?? '';
        parts.forEach((line) => handleScan(line.trim()));
      }
    } catch (err: unknown) {
      setScannerStatus('error');
      setScannerError((err as Error)?.message ?? 'Scanner error');
    } finally {
      reader.releaseLock();
      void readableClosed.catch(() => undefined);
    }
  }

  function handleScan(value: string) {
    if (!value) return;
    if (scanTarget === 'student') {
      setStudentId(value);
      void lookupBorrower(value);
    } else {
      setIsbn(value);
      void lookupBook(value);
    }
  }

  async function lookupBorrower(id: string): Promise<BorrowerRecord | null> {
    if (!id.trim()) return null;
    try {
      const data = await libraryService.borrowers.getByStudentId(id.trim());
      setBorrowerLookup(data);
      return data;
    } catch {
      setBorrowerLookup(null);
      toast.error('Borrower not found');
      return null;
    }
  }

  async function lookupBook(code: string): Promise<BookRecord | null> {
    if (!code.trim()) return null;
    try {
      const data = await libraryService.books.getByIsbn(code.trim());
      setBookLookup(data);
      return data;
    } catch {
      setBookLookup(null);
      toast.error('Book not found for this ISBN');
      return null;
    }
  }

  async function lendBook() {
    const isbnValue = isbn.trim();
    if (!isbnValue) {
      toast.error('Enter or scan an ISBN');
      return;
    }

    const borrowerValue = studentId.trim();
    if (!borrowerValue) {
      toast.error('Enter or scan a student ID');
      return;
    }

    let borrower = borrowerLookup;
    if (!borrower || borrower.studentId !== borrowerValue) {
      borrower = await lookupBorrower(borrowerValue);
    }
    if (!borrower) return;

    let book = bookLookup;
    if (!book || book.isbn !== isbnValue) {
      book = await lookupBook(isbnValue);
    }
    if (!book) return;

    const borrowerId = borrower._id;

    try {
      await libraryService.loans.create({ borrowerId, isbn: isbnValue });
      toast.success('Loan created');
      setIsbn('');
      setBookLookup(null);
      void loadLoans();
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      toast.error(ax.response?.data?.message ?? 'Failed to create loan');
    }
  }

  async function returnLoan() {
    if (!loanId.trim()) {
      toast.error('Enter a loan ID');
      return;
    }
    try {
      await libraryService.loans.returnLoan(loanId.trim());
      toast.success('Loan returned');
      setLoanId('');
      void loadLoans();
      void loadFees();
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      toast.error(ax.response?.data?.message ?? 'Return failed');
    }
  }

  function openBookForm(book?: BookRecord) {
    if (book) {
      setEditingBook(book);
      setBookForm({
        isbn: book.isbn,
        title: book.title,
        subtitle: book.subtitle ?? '',
        authors: joinCsv(book.authors),
        publisher: book.publisher ?? '',
        publishYear: book.publishYear ? String(book.publishYear) : '',
        edition: book.edition ?? '',
        language: book.language ?? '',
        categories: joinCsv(book.categories),
        description: book.description ?? '',
        coverImage: book.coverImage ?? '',
        isActive: book.isActive,
      });
    } else {
      setEditingBook(null);
      setBookForm(defaultBookForm());
    }
    setBookFormOpen(true);
  }

  async function saveBook() {
    const payload = {
      isbn: bookForm.isbn.trim(),
      title: bookForm.title.trim(),
      subtitle: bookForm.subtitle.trim() || undefined,
      authors: parseCsv(bookForm.authors),
      publisher: bookForm.publisher.trim() || undefined,
      publishYear: bookForm.publishYear ? Number(bookForm.publishYear) : undefined,
      edition: bookForm.edition.trim() || undefined,
      language: bookForm.language.trim() || undefined,
      categories: parseCsv(bookForm.categories),
      description: bookForm.description.trim() || undefined,
      coverImage: bookForm.coverImage.trim() || undefined,
      isActive: bookForm.isActive,
    };

    try {
      if (editingBook) {
        await libraryService.books.update(editingBook._id, payload);
        toast.success('Book updated');
      } else {
        await libraryService.books.create(payload);
        toast.success('Book created');
      }
      setBookFormOpen(false);
      void loadBooks();
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      toast.error(ax.response?.data?.message ?? 'Save failed');
    }
  }

  async function deleteBook(book: BookRecord) {
    if (!window.confirm(`Delete ${book.title}?`)) return;
    try {
      await libraryService.books.remove(book._id);
      toast.success('Book deleted');
      void loadBooks();
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      toast.error(ax.response?.data?.message ?? 'Delete failed');
    }
  }

  function openCopyForm(copy?: BookCopyRecord) {
    if (copy) {
      setEditingCopy(copy);
      setCopyForm({
        bookId: typeof copy.book === 'string' ? copy.book : copy.book._id,
        barcode: copy.barcode ?? '',
        status: copy.status,
        condition: copy.condition,
        shelfLocation: copy.shelfLocation ?? '',
        notes: copy.notes ?? '',
        acquiredAt: toLocalDateTime(copy.acquiredAt),
        isActive: copy.isActive,
      });
    } else {
      setEditingCopy(null);
      setCopyForm(defaultCopyForm());
    }
    setCopyFormOpen(true);
  }

  async function saveCopy() {
    const payload = {
      bookId: copyForm.bookId,
      barcode: copyForm.barcode.trim() || undefined,
      status: copyForm.status,
      condition: copyForm.condition,
      shelfLocation: copyForm.shelfLocation.trim() || undefined,
      notes: copyForm.notes.trim() || undefined,
      acquiredAt: toIso(copyForm.acquiredAt),
      isActive: copyForm.isActive,
    };
    if (!payload.bookId) {
      toast.error('Book is required');
      return;
    }

    try {
      if (editingCopy) {
        await libraryService.copies.update(editingCopy._id, payload);
        toast.success('Copy updated');
      } else {
        await libraryService.copies.create(payload);
        toast.success('Copy created');
      }
      setCopyFormOpen(false);
      void loadCopies();
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      toast.error(ax.response?.data?.message ?? 'Save failed');
    }
  }

  async function deleteCopy(copy: BookCopyRecord) {
    if (!window.confirm('Delete this copy?')) return;
    try {
      await libraryService.copies.remove(copy._id);
      toast.success('Copy deleted');
      void loadCopies();
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      toast.error(ax.response?.data?.message ?? 'Delete failed');
    }
  }

  function openBorrowerForm(borrower?: BorrowerRecord) {
    if (borrower) {
      setEditingBorrower(borrower);
      setBorrowerForm({
        studentId: borrower.studentId,
        name: borrower.name,
        email: borrower.email ?? '',
        department: borrower.department ?? '',
        program: borrower.program ?? '',
        batch: borrower.batch ?? '',
        phone: borrower.phone ?? '',
        externalRef: borrower.externalRef ?? '',
        notes: borrower.notes ?? '',
        isActive: borrower.isActive,
      });
    } else {
      setEditingBorrower(null);
      setBorrowerForm(defaultBorrowerForm());
    }
    setBorrowerFormOpen(true);
  }

  async function saveBorrower() {
    const payload = {
      studentId: borrowerForm.studentId.trim(),
      name: borrowerForm.name.trim(),
      email: borrowerForm.email.trim() || undefined,
      department: borrowerForm.department.trim() || undefined,
      program: borrowerForm.program.trim() || undefined,
      batch: borrowerForm.batch.trim() || undefined,
      phone: borrowerForm.phone.trim() || undefined,
      externalRef: borrowerForm.externalRef.trim() || undefined,
      notes: borrowerForm.notes.trim() || undefined,
      isActive: borrowerForm.isActive,
    };

    try {
      if (editingBorrower) {
        await libraryService.borrowers.update(editingBorrower._id, payload);
        toast.success('Borrower updated');
      } else {
        await libraryService.borrowers.create(payload);
        toast.success('Borrower created');
      }
      setBorrowerFormOpen(false);
      void loadBorrowers();
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      toast.error(ax.response?.data?.message ?? 'Save failed');
    }
  }

  async function deleteBorrower(borrower: BorrowerRecord) {
    if (!window.confirm(`Delete borrower ${borrower.name}?`)) return;
    try {
      await libraryService.borrowers.remove(borrower._id);
      toast.success('Borrower deleted');
      void loadBorrowers();
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      toast.error(ax.response?.data?.message ?? 'Delete failed');
    }
  }

  function openHoldForm(hold?: HoldRecord) {
    if (hold) {
      setEditingHold(hold);
      setHoldForm({
        borrowerId: typeof hold.borrower === 'string' ? hold.borrower : hold.borrower._id,
        bookId: typeof hold.book === 'string' ? hold.book : hold.book._id,
        status: hold.status,
        placedAt: toLocalDateTime(hold.placedAt),
        expiresAt: toLocalDateTime(hold.expiresAt),
        notes: hold.notes ?? '',
      });
    } else {
      setEditingHold(null);
      setHoldForm(defaultHoldForm());
    }
    setHoldFormOpen(true);
  }

  async function saveHold() {
    const payload = {
      borrowerId: holdForm.borrowerId,
      bookId: holdForm.bookId,
      status: holdForm.status,
      placedAt: toIso(holdForm.placedAt),
      expiresAt: toIso(holdForm.expiresAt),
      notes: holdForm.notes.trim() || undefined,
    };

    if (!payload.borrowerId || !payload.bookId) {
      toast.error('Borrower and book are required');
      return;
    }

    try {
      if (editingHold) {
        await libraryService.holds.update(editingHold._id, payload);
        toast.success('Hold updated');
      } else {
        await libraryService.holds.create(payload);
        toast.success('Hold created');
      }
      setHoldFormOpen(false);
      void loadHolds();
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      toast.error(ax.response?.data?.message ?? 'Save failed');
    }
  }

  async function deleteHold(hold: HoldRecord) {
    if (!window.confirm('Delete this hold?')) return;
    try {
      await libraryService.holds.remove(hold._id);
      toast.success('Hold deleted');
      void loadHolds();
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      toast.error(ax.response?.data?.message ?? 'Delete failed');
    }
  }

  function openFeeForm(fee?: FeeRecord) {
    if (fee) {
      setEditingFee(fee);
      setFeeForm({
        borrowerId: typeof fee.borrower === 'string' ? fee.borrower : fee.borrower._id,
        loanId: typeof fee.loan === 'string' ? fee.loan : fee.loan?._id ?? '',
        amount: String(fee.amount),
        currency: fee.currency,
        reason: fee.reason,
        status: fee.status,
      });
    } else {
      setEditingFee(null);
      setFeeForm(defaultFeeForm());
    }
    setFeeFormOpen(true);
  }

  async function saveFee() {
    const amountValue = Number(feeForm.amount);
    const payload = {
      borrowerId: feeForm.borrowerId,
      loanId: feeForm.loanId.trim() || undefined,
      amount: amountValue,
      currency: feeForm.currency.trim() || undefined,
      reason: feeForm.reason.trim(),
      status: feeForm.status,
    };

    if (!payload.borrowerId || !payload.reason || Number.isNaN(payload.amount) || payload.amount <= 0) {
      toast.error('Borrower, amount, and reason are required');
      return;
    }

    if (payload.status === 'waived' && editingFee?.status !== 'waived') {
      toast.error('Fee waivers use a restricted workflow');
      return;
    }

    try {
      if (editingFee) {
        await libraryService.fees.update(editingFee._id, payload);
        toast.success('Fee updated');
      } else {
        await libraryService.fees.create(payload);
        toast.success('Fee created');
      }
      setFeeFormOpen(false);
      void loadFees();
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      toast.error(ax.response?.data?.message ?? 'Save failed');
    }
  }

  async function deleteFee(fee: FeeRecord) {
    if (!window.confirm('Delete this fee?')) return;
    try {
      await libraryService.fees.remove(fee._id);
      toast.success('Fee deleted');
      void loadFees();
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      toast.error(ax.response?.data?.message ?? 'Delete failed');
    }
  }

  async function renewLoan(loan: LoanRecord) {
    try {
      await libraryService.loans.renew(loan._id);
      toast.success('Loan renewed');
      void loadLoans();
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      toast.error(ax.response?.data?.message ?? 'Renew failed');
    }
  }

  async function returnLoanFromList(loan: LoanRecord) {
    try {
      await libraryService.loans.returnLoan(loan._id);
      toast.success('Loan returned');
      void loadLoans();
      void loadFees();
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      toast.error(ax.response?.data?.message ?? 'Return failed');
    }
  }

  const bookRows = useMemo(
    () =>
      books.map((book) => ({
        ...book,
        id: book._id,
        authorsLabel: book.authors?.length ? book.authors.join(', ') : '-',
        categoriesLabel: book.categories?.length ? book.categories.join(', ') : '-',
      })),
    [books]
  );

  const copyRows = useMemo(
    () =>
      copies.map((copy) => ({
        ...copy,
        id: copy._id,
        bookLabel: bookLabel(copy.book),
      })),
    [copies]
  );

  const borrowerRows = useMemo(
    () =>
      borrowers.map((b) => ({
        ...b,
        id: b._id,
      })),
    [borrowers]
  );

  const loanRows = useMemo(
    () =>
      loans.map((loan) => ({
        ...loan,
        id: loan._id,
        borrowerLabel: borrowerLabel(loan.borrower),
        bookLabel: bookLabel(loan.book),
        copyLabel: copyLabel(loan.copy),
      })),
    [loans]
  );

  const holdRows = useMemo(
    () =>
      holds.map((hold) => ({
        ...hold,
        id: hold._id,
        borrowerLabel: borrowerLabel(hold.borrower),
        bookLabel: bookLabel(hold.book),
      })),
    [holds]
  );

  const feeRows = useMemo(
    () =>
      fees.map((fee) => ({
        ...fee,
        id: fee._id,
        borrowerLabel: borrowerLabel(fee.borrower),
      })),
    [fees]
  );

  const bookColumns: ListingColumn<typeof bookRows[number]>[] = [
    { key: 'title', header: 'Title', minWidth: '200px' },
    { key: 'isbn', header: 'ISBN', minWidth: '140px' },
    { key: 'authorsLabel', header: 'Authors', minWidth: '180px' },
    { key: 'categoriesLabel', header: 'Categories', minWidth: '160px' },
    {
      key: 'isActive',
      header: 'Status',
      minWidth: '90px',
      render: (row) => (
        <span className={`badge ${row.isActive ? 'badge-success' : 'badge-error'}`}>
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      minWidth: '180px',
      render: (row) => (
        <div className="library-actions">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => openBookForm(row)}>
            Edit
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => deleteBook(row)}>
            Delete
          </button>
        </div>
      ),
    },
  ];

  const copyColumns: ListingColumn<typeof copyRows[number]>[] = [
    { key: 'bookLabel', header: 'Book', minWidth: '200px' },
    { key: 'barcode', header: 'Barcode', minWidth: '140px', render: (row) => row.barcode || '-' },
    { key: 'status', header: 'Status', minWidth: '120px' },
    { key: 'condition', header: 'Condition', minWidth: '120px' },
    { key: 'shelfLocation', header: 'Shelf', minWidth: '120px', render: (row) => row.shelfLocation || '-' },
    {
      key: 'isActive',
      header: 'Active',
      minWidth: '90px',
      render: (row) => (
        <span className={`badge ${row.isActive ? 'badge-success' : 'badge-error'}`}>
          {row.isActive ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      minWidth: '180px',
      render: (row) => (
        <div className="library-actions">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => openCopyForm(row)}>
            Edit
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => deleteCopy(row)}>
            Delete
          </button>
        </div>
      ),
    },
  ];

  const borrowerColumns: ListingColumn<typeof borrowerRows[number]>[] = [
    { key: 'name', header: 'Name', minWidth: '180px' },
    { key: 'studentId', header: 'Student ID', minWidth: '140px' },
    { key: 'department', header: 'Department', minWidth: '140px', render: (row) => row.department || '-' },
    {
      key: 'isActive',
      header: 'Status',
      minWidth: '90px',
      render: (row) => (
        <span className={`badge ${row.isActive ? 'badge-success' : 'badge-error'}`}>
          {row.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      minWidth: '180px',
      render: (row) => (
        <div className="library-actions">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => openBorrowerForm(row)}>
            Edit
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => deleteBorrower(row)}>
            Delete
          </button>
        </div>
      ),
    },
  ];

  const loanColumns: ListingColumn<typeof loanRows[number]>[] = [
    { key: 'borrowerLabel', header: 'Borrower', minWidth: '200px' },
    { key: 'bookLabel', header: 'Book', minWidth: '200px' },
    { key: 'copyLabel', header: 'Copy', minWidth: '140px' },
    {
      key: 'dueDate',
      header: 'Due',
      minWidth: '120px',
      render: (row) => new Date(row.dueDate).toLocaleDateString(),
    },
    { key: 'status', header: 'Status', minWidth: '100px' },
    {
      key: 'penaltyAccrued',
      header: 'Penalty',
      minWidth: '100px',
      render: (row) => `Rs ${row.penaltyAccrued ?? 0}`,
    },
    {
      key: 'actions',
      header: 'Actions',
      minWidth: '200px',
      render: (row) => (
        <div className="library-actions">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            disabled={row.status !== 'active'}
            onClick={() => renewLoan(row)}
          >
            Renew
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            disabled={row.status === 'returned'}
            onClick={() => returnLoanFromList(row)}
          >
            Return
          </button>
        </div>
      ),
    },
  ];

  const holdColumns: ListingColumn<typeof holdRows[number]>[] = [
    { key: 'borrowerLabel', header: 'Borrower', minWidth: '200px' },
    { key: 'bookLabel', header: 'Book', minWidth: '200px' },
    { key: 'status', header: 'Status', minWidth: '120px' },
    {
      key: 'expiresAt',
      header: 'Expires',
      minWidth: '140px',
      render: (row) => (row.expiresAt ? new Date(row.expiresAt).toLocaleDateString() : '-'),
    },
    {
      key: 'actions',
      header: 'Actions',
      minWidth: '180px',
      render: (row) => (
        <div className="library-actions">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => openHoldForm(row)}>
            Edit
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => deleteHold(row)}>
            Delete
          </button>
        </div>
      ),
    },
  ];

  const feeColumns: ListingColumn<typeof feeRows[number]>[] = [
    { key: 'borrowerLabel', header: 'Borrower', minWidth: '200px' },
    { key: 'reason', header: 'Reason', minWidth: '200px' },
    { key: 'amount', header: 'Amount', minWidth: '110px', render: (row) => `Rs ${row.amount}` },
    { key: 'status', header: 'Status', minWidth: '110px' },
    {
      key: 'appliedAt',
      header: 'Applied',
      minWidth: '140px',
      render: (row) => (row.appliedAt ? new Date(row.appliedAt).toLocaleDateString() : '-'),
    },
    {
      key: 'actions',
      header: 'Actions',
      minWidth: '180px',
      render: (row) => (
        <div className="library-actions">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => openFeeForm(row)}>
            Edit
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => deleteFee(row)}>
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <DashboardShell pageTitle="Library Management">
      <div className="page-header">
        <div className="page-eyebrow">Library</div>
        <h2 className="page-title">Library Management</h2>
        <p className="page-subtitle">
          Manage catalog, lending, and fees. Scan student ID and ISBN to lend instantly.
        </p>
      </div>

      <div className="library-tabs">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`btn btn-sm ${tab === item.id ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'lend' && (
        <div className="library-grid">
          <div className="library-panel">
            <div className="library-panel-header">
              <h3 className="library-panel-title">Scanner</h3>
              <div className={`library-status library-status-${scannerStatus}`}>
                {scannerStatus === 'connected' ? 'Connected' : scannerStatus}
              </div>
            </div>
            <p className="library-panel-sub">
              Connect a WebSerial scanner. Set the scan target, then scan student ID or ISBN.
            </p>
            {scannerStatus === 'error' && scannerError && (
              <div className="alert-banner error" role="alert">
                {scannerError}
              </div>
            )}
            <div className="library-actions">
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => void connectScanner()}
                disabled={scannerStatus === 'connecting' || scannerStatus === 'connected'}
              >
                Connect Scanner
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => void disconnectScanner()}
                disabled={scannerStatus !== 'connected'}
              >
                Disconnect
              </button>
            </div>
            <div className="library-scan-targets">
              <button
                type="button"
                className={`btn btn-sm ${scanTarget === 'student' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setScanTarget('student')}
              >
                Scan to Student ID
              </button>
              <button
                type="button"
                className={`btn btn-sm ${scanTarget === 'isbn' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setScanTarget('isbn')}
              >
                Scan to ISBN
              </button>
            </div>
          </div>

          <div className="library-panel">
            <h3 className="library-panel-title">Lend Book</h3>
            <div className="library-form">
              <label className="form-label">
                Student ID
                <input
                  className="input"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="Scan or enter student ID"
                />
              </label>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => void lookupBorrower(studentId)}>
                Lookup Borrower
              </button>
              {borrowerLookup && (
                <div className="library-lookup">
                  <strong>{borrowerLookup.name}</strong>
                  <span>{borrowerLookup.department || 'Department not set'}</span>
                </div>
              )}

              <label className="form-label">
                ISBN
                <input
                  className="input"
                  value={isbn}
                  onChange={(e) => setIsbn(e.target.value)}
                  placeholder="Scan or enter ISBN"
                />
              </label>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => void lookupBook(isbn)}>
                Lookup Book
              </button>
              {bookLookup && (
                <div className="library-lookup">
                  <strong>{bookLookup.title}</strong>
                  <span>{bookLookup.authors?.join(', ') || 'Author not set'}</span>
                </div>
              )}

              <button type="button" className="btn btn-primary" onClick={() => void lendBook()}>
                Lend Book
              </button>
            </div>
          </div>

          <div className="library-panel">
            <h3 className="library-panel-title">Return Book</h3>
            <div className="library-form">
              <label className="form-label">
                Loan ID
                <input
                  className="input"
                  value={loanId}
                  onChange={(e) => setLoanId(e.target.value)}
                  placeholder="Loan record ID"
                />
              </label>
              <button type="button" className="btn btn-primary" onClick={() => void returnLoan()}>
                Return Book
              </button>
            </div>
          </div>

          <div className="library-panel library-panel--full">
            <h3 className="library-panel-title">Recent Loans</h3>
            {loading.loans ? (
              <div className="loading-spinner" aria-label="Loading" />
            ) : (
              <DataListing
                columns={loanColumns}
                data={loanRows.slice(0, 8)}
                emptyState="No loans yet."
              />
            )}
          </div>
        </div>
      )}

      {tab === 'catalog' && (
        <DataListing
          title="Books"
          columns={bookColumns}
          data={bookRows}
          searchable
          searchPlaceholder="Search by title or ISBN"
          searchKeys={['title', 'isbn', 'authorsLabel']}
          emptyState={loading.books ? 'Loading...' : 'No books found.'}
          actions={
            <button type="button" className="btn btn-primary btn-sm" onClick={() => openBookForm()}>
              New Book
            </button>
          }
        />
      )}

      {tab === 'copies' && (
        <DataListing
          title="Book Copies"
          columns={copyColumns}
          data={copyRows}
          searchable
          searchPlaceholder="Search by barcode or book"
          searchKeys={['barcode', 'bookLabel', 'status']}
          emptyState={loading.copies ? 'Loading...' : 'No copies found.'}
          actions={
            <button type="button" className="btn btn-primary btn-sm" onClick={() => openCopyForm()}>
              New Copy
            </button>
          }
        />
      )}

      {tab === 'borrowers' && (
        <DataListing
          title="Borrowers"
          columns={borrowerColumns}
          data={borrowerRows}
          searchable
          searchPlaceholder="Search by name or student ID"
          searchKeys={['name', 'studentId', 'department']}
          emptyState={loading.borrowers ? 'Loading...' : 'No borrowers found.'}
          actions={
            <button type="button" className="btn btn-primary btn-sm" onClick={() => openBorrowerForm()}>
              New Borrower
            </button>
          }
        />
      )}

      {tab === 'loans' && (
        <DataListing
          title="Loans"
          columns={loanColumns}
          data={loanRows}
          searchable
          searchPlaceholder="Search by borrower or ISBN"
          searchKeys={['borrowerLabel', 'bookLabel', 'copyLabel', 'status']}
          emptyState={loading.loans ? 'Loading...' : 'No loans found.'}
        />
      )}

      {tab === 'holds' && (
        <DataListing
          title="Holds"
          columns={holdColumns}
          data={holdRows}
          searchable
          searchPlaceholder="Search by borrower or book"
          searchKeys={['borrowerLabel', 'bookLabel', 'status']}
          emptyState={loading.holds ? 'Loading...' : 'No holds found.'}
          actions={
            <button type="button" className="btn btn-primary btn-sm" onClick={() => openHoldForm()}>
              New Hold
            </button>
          }
        />
      )}

      {tab === 'fees' && (
        <DataListing
          title="Fees"
          columns={feeColumns}
          data={feeRows}
          searchable
          searchPlaceholder="Search by borrower or reason"
          searchKeys={['borrowerLabel', 'reason', 'status']}
          emptyState={loading.fees ? 'Loading...' : 'No fees found.'}
          actions={
            <button type="button" className="btn btn-primary btn-sm" onClick={() => openFeeForm()}>
              New Fee
            </button>
          }
        />
      )}

      <Dialog open={bookFormOpen} onClose={() => setBookFormOpen(false)} title={editingBook ? 'Edit Book' : 'New Book'}>
        <div className="library-form-grid">
          <label className="form-label">
            ISBN
            <input className="input" value={bookForm.isbn} onChange={(e) => setBookForm((p) => ({ ...p, isbn: e.target.value }))} />
          </label>
          <label className="form-label">
            Title
            <input className="input" value={bookForm.title} onChange={(e) => setBookForm((p) => ({ ...p, title: e.target.value }))} />
          </label>
          <label className="form-label">
            Subtitle
            <input className="input" value={bookForm.subtitle} onChange={(e) => setBookForm((p) => ({ ...p, subtitle: e.target.value }))} />
          </label>
          <label className="form-label">
            Authors (comma separated)
            <input className="input" value={bookForm.authors} onChange={(e) => setBookForm((p) => ({ ...p, authors: e.target.value }))} />
          </label>
          <label className="form-label">
            Publisher
            <input className="input" value={bookForm.publisher} onChange={(e) => setBookForm((p) => ({ ...p, publisher: e.target.value }))} />
          </label>
          <label className="form-label">
            Publish year
            <input className="input" value={bookForm.publishYear} onChange={(e) => setBookForm((p) => ({ ...p, publishYear: e.target.value }))} />
          </label>
          <label className="form-label">
            Edition
            <input className="input" value={bookForm.edition} onChange={(e) => setBookForm((p) => ({ ...p, edition: e.target.value }))} />
          </label>
          <label className="form-label">
            Language
            <input className="input" value={bookForm.language} onChange={(e) => setBookForm((p) => ({ ...p, language: e.target.value }))} />
          </label>
          <label className="form-label">
            Categories (comma separated)
            <input className="input" value={bookForm.categories} onChange={(e) => setBookForm((p) => ({ ...p, categories: e.target.value }))} />
          </label>
          <label className="form-label">
            Description
            <textarea className="input" value={bookForm.description} onChange={(e) => setBookForm((p) => ({ ...p, description: e.target.value }))} rows={3} />
          </label>
          <label className="form-label">
            Cover image URL
            <input className="input" value={bookForm.coverImage} onChange={(e) => setBookForm((p) => ({ ...p, coverImage: e.target.value }))} />
          </label>
          <label className="form-label checkbox-row">
            <input type="checkbox" checked={bookForm.isActive} onChange={(e) => setBookForm((p) => ({ ...p, isActive: e.target.checked }))} />
            Active
          </label>
        </div>
        <div className="dialog-actions">
          <button type="button" className="btn btn-ghost" onClick={() => setBookFormOpen(false)}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={() => void saveBook()}>
            Save
          </button>
        </div>
      </Dialog>

      <Dialog open={copyFormOpen} onClose={() => setCopyFormOpen(false)} title={editingCopy ? 'Edit Copy' : 'New Copy'}>
        <div className="library-form-grid">
          <label className="form-label">
            Book
            <select
              className="input"
              value={copyForm.bookId}
              onChange={(e) => setCopyForm((p) => ({ ...p, bookId: e.target.value }))}
            >
              <option value="">Select a book</option>
              {books.map((book) => (
                <option key={book._id} value={book._id}>
                  {book.title} ({book.isbn})
                </option>
              ))}
            </select>
          </label>
          <label className="form-label">
            Barcode
            <input className="input" value={copyForm.barcode} onChange={(e) => setCopyForm((p) => ({ ...p, barcode: e.target.value }))} />
          </label>
          <label className="form-label">
            Status
            <select
              className="input"
              value={copyForm.status}
              onChange={(e) => setCopyForm((p) => ({ ...p, status: e.target.value as BookCopyStatus }))}
            >
              <option value="available">Available</option>
              <option value="loaned">Loaned</option>
              <option value="lost">Lost</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </label>
          <label className="form-label">
            Condition
            <select
              className="input"
              value={copyForm.condition}
              onChange={(e) => setCopyForm((p) => ({ ...p, condition: e.target.value as BookCopyCondition }))}
            >
              <option value="new">New</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
          </label>
          <label className="form-label">
            Shelf location
            <input className="input" value={copyForm.shelfLocation} onChange={(e) => setCopyForm((p) => ({ ...p, shelfLocation: e.target.value }))} />
          </label>
          <label className="form-label">
            Notes
            <input className="input" value={copyForm.notes} onChange={(e) => setCopyForm((p) => ({ ...p, notes: e.target.value }))} />
          </label>
          <label className="form-label">
            Acquired at
            <input className="input" type="datetime-local" value={copyForm.acquiredAt} onChange={(e) => setCopyForm((p) => ({ ...p, acquiredAt: e.target.value }))} />
          </label>
          <label className="form-label checkbox-row">
            <input type="checkbox" checked={copyForm.isActive} onChange={(e) => setCopyForm((p) => ({ ...p, isActive: e.target.checked }))} />
            Active
          </label>
        </div>
        <div className="dialog-actions">
          <button type="button" className="btn btn-ghost" onClick={() => setCopyFormOpen(false)}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={() => void saveCopy()}>
            Save
          </button>
        </div>
      </Dialog>

      <Dialog open={borrowerFormOpen} onClose={() => setBorrowerFormOpen(false)} title={editingBorrower ? 'Edit Borrower' : 'New Borrower'}>
        <div className="library-form-grid">
          <label className="form-label">
            Student ID
            <input className="input" value={borrowerForm.studentId} onChange={(e) => setBorrowerForm((p) => ({ ...p, studentId: e.target.value }))} />
          </label>
          <label className="form-label">
            Name
            <input className="input" value={borrowerForm.name} onChange={(e) => setBorrowerForm((p) => ({ ...p, name: e.target.value }))} />
          </label>
          <label className="form-label">
            Email
            <input className="input" value={borrowerForm.email} onChange={(e) => setBorrowerForm((p) => ({ ...p, email: e.target.value }))} />
          </label>
          <label className="form-label">
            Department
            <input className="input" value={borrowerForm.department} onChange={(e) => setBorrowerForm((p) => ({ ...p, department: e.target.value }))} />
          </label>
          <label className="form-label">
            Program
            <input className="input" value={borrowerForm.program} onChange={(e) => setBorrowerForm((p) => ({ ...p, program: e.target.value }))} />
          </label>
          <label className="form-label">
            Batch
            <input className="input" value={borrowerForm.batch} onChange={(e) => setBorrowerForm((p) => ({ ...p, batch: e.target.value }))} />
          </label>
          <label className="form-label">
            Phone
            <input className="input" value={borrowerForm.phone} onChange={(e) => setBorrowerForm((p) => ({ ...p, phone: e.target.value }))} />
          </label>
          <label className="form-label">
            External ref
            <input className="input" value={borrowerForm.externalRef} onChange={(e) => setBorrowerForm((p) => ({ ...p, externalRef: e.target.value }))} />
          </label>
          <label className="form-label">
            Notes
            <textarea className="input" value={borrowerForm.notes} onChange={(e) => setBorrowerForm((p) => ({ ...p, notes: e.target.value }))} rows={3} />
          </label>
          <label className="form-label checkbox-row">
            <input type="checkbox" checked={borrowerForm.isActive} onChange={(e) => setBorrowerForm((p) => ({ ...p, isActive: e.target.checked }))} />
            Active
          </label>
        </div>
        <div className="dialog-actions">
          <button type="button" className="btn btn-ghost" onClick={() => setBorrowerFormOpen(false)}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={() => void saveBorrower()}>
            Save
          </button>
        </div>
      </Dialog>

      <Dialog open={holdFormOpen} onClose={() => setHoldFormOpen(false)} title={editingHold ? 'Edit Hold' : 'New Hold'}>
        <div className="library-form-grid">
          <label className="form-label">
            Borrower
            <select
              className="input"
              value={holdForm.borrowerId}
              onChange={(e) => setHoldForm((p) => ({ ...p, borrowerId: e.target.value }))}
            >
              <option value="">Select borrower</option>
              {borrowers.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name} ({b.studentId})
                </option>
              ))}
            </select>
          </label>
          <label className="form-label">
            Book
            <select
              className="input"
              value={holdForm.bookId}
              onChange={(e) => setHoldForm((p) => ({ ...p, bookId: e.target.value }))}
            >
              <option value="">Select book</option>
              {books.map((book) => (
                <option key={book._id} value={book._id}>
                  {book.title} ({book.isbn})
                </option>
              ))}
            </select>
          </label>
          <label className="form-label">
            Status
            <select
              className="input"
              value={holdForm.status}
              onChange={(e) => setHoldForm((p) => ({ ...p, status: e.target.value as HoldStatus }))}
            >
              <option value="active">Active</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="canceled">Canceled</option>
              <option value="expired">Expired</option>
            </select>
          </label>
          <label className="form-label">
            Placed at
            <input className="input" type="datetime-local" value={holdForm.placedAt} onChange={(e) => setHoldForm((p) => ({ ...p, placedAt: e.target.value }))} />
          </label>
          <label className="form-label">
            Expires at
            <input className="input" type="datetime-local" value={holdForm.expiresAt} onChange={(e) => setHoldForm((p) => ({ ...p, expiresAt: e.target.value }))} />
          </label>
          <label className="form-label">
            Notes
            <textarea className="input" value={holdForm.notes} onChange={(e) => setHoldForm((p) => ({ ...p, notes: e.target.value }))} rows={2} />
          </label>
        </div>
        <div className="dialog-actions">
          <button type="button" className="btn btn-ghost" onClick={() => setHoldFormOpen(false)}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={() => void saveHold()}>
            Save
          </button>
        </div>
      </Dialog>

      <Dialog open={feeFormOpen} onClose={() => setFeeFormOpen(false)} title={editingFee ? 'Edit Fee' : 'New Fee'}>
        <div className="library-form-grid">
          <label className="form-label">
            Borrower
            <select
              className="input"
              value={feeForm.borrowerId}
              onChange={(e) => setFeeForm((p) => ({ ...p, borrowerId: e.target.value }))}
            >
              <option value="">Select borrower</option>
              {borrowers.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name} ({b.studentId})
                </option>
              ))}
            </select>
          </label>
          <label className="form-label">
            Loan ID (optional)
            <select
              className="input"
              value={feeForm.loanId}
              onChange={(e) => setFeeForm((p) => ({ ...p, loanId: e.target.value }))}
            >
              <option value="">No loan</option>
              {loans.map((loan) => (
                <option key={loan._id} value={loan._id}>
                  {loan._id}
                </option>
              ))}
            </select>
          </label>
          <label className="form-label">
            Amount
            <input className="input" value={feeForm.amount} onChange={(e) => setFeeForm((p) => ({ ...p, amount: e.target.value }))} />
          </label>
          <label className="form-label">
            Currency
            <input className="input" value={feeForm.currency} onChange={(e) => setFeeForm((p) => ({ ...p, currency: e.target.value }))} />
          </label>
          <label className="form-label">
            Reason
            <textarea className="input" value={feeForm.reason} onChange={(e) => setFeeForm((p) => ({ ...p, reason: e.target.value }))} rows={2} />
          </label>
          <label className="form-label">
            Status
            <select
              className="input"
              value={feeForm.status}
              onChange={(e) => setFeeForm((p) => ({ ...p, status: e.target.value as FeeStatus }))}
              disabled={editingFee?.status === 'waived'}
            >
              {editingFee?.status === 'waived' ? (
                <option value="waived">Waived</option>
              ) : (
                <>
                  <option value="applied">Applied</option>
                  <option value="paid">Paid</option>
                </>
              )}
            </select>
          </label>
        </div>
        <div className="dialog-actions">
          <button type="button" className="btn btn-ghost" onClick={() => setFeeFormOpen(false)}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={() => void saveFee()}>
            Save
          </button>
        </div>
      </Dialog>
    </DashboardShell>
  );
}
