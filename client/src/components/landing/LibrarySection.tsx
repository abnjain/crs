import { Button, Badge, KPICard } from '../index';

const kpis = [
  { label: 'Books Available', value: '6,834', sub: 'of 8,200+ total volumes' },
  { label: 'Publications', value: '340+', sub: 'faculty publications' },
  { label: 'Active Borrows', value: '1,366', sub: 'currently checked out' },
  { label: 'E-Journals', value: '120+', sub: 'digital subscriptions' },
];

const books = [
  {
    spineColor: '#1E5FA8',
    title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
    author: 'Gang of Four',
    category: 'Software Engineering',
    status: 'success' as const,
  },
  {
    spineColor: '#4A8A1E',
    title: 'Introduction to Algorithms, 4th Edition',
    author: 'Cormen, Leiserson, Rivest, Stein',
    category: 'Algorithms',
    status: 'success' as const,
  },
  {
    spineColor: '#C9922A',
    title: 'Cloud Native Patterns',
    author: 'Cornelia Davis',
    category: 'Cloud Computing',
    status: 'neutral' as const,
  },
  {
    spineColor: '#D32F2F',
    title: 'Database Internals: A Deep Dive',
    author: 'Alex Petrov',
    category: 'Databases',
    status: 'success' as const,
  },
  {
    spineColor: '#E87722',
    title: 'Computer Networks, 6th Edition',
    author: 'Andrew S. Tanenbaum',
    category: 'Networking',
    status: 'success' as const,
  },
];

export function LibrarySection() {
  return (
    <section className="section section-alt" id="library" aria-labelledby="library-h">
      <div className="container">
        <div className="grid-2" style={{ gap: 'var(--space-16)', alignItems: 'start' }}>
          <div>
            <div className="section-eyebrow">Digital Library</div>
            <h2 className="section-title" id="library-h">
              Library Catalog & Resources
            </h2>
            <p className="section-desc">
              Access the curated catalog of academic books, academic journals, and reference
              materials. Borrow books and track availability in real time.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'var(--space-4)',
                marginTop: 'var(--space-8)',
              }}
            >
              {kpis.map((kpi) => (
                <KPICard key={kpi.label} label={kpi.label} value={kpi.value} sub={kpi.sub} />
              ))}
            </div>

            <div style={{ marginTop: 'var(--space-6)' }}>
              <Button variant="primary" to="/library">
                Browse Full Catalog
              </Button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-4)' }}>
              <span
                style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--weight-semibold)',
                  color: 'var(--text-primary)',
                }}
              >
                Recently Added
              </span>
              <Button variant="ghost" size="sm" to="/library">
                View All
              </Button>
            </div>

            <div className="book-list" role="list" aria-label="Recently added books">
              {books.map((book) => (
                <div key={book.title} className="book-row" role="listitem">
                  <div
                    className="book-spine"
                    style={{ background: book.spineColor }}
                    aria-hidden="true"
                  />
                  <div className="book-info">
                    <div className="book-title">{book.title}</div>
                    <div className="book-author">{book.author}</div>
                    <span className="book-cat">{book.category}</span>
                  </div>
                  <Badge variant={book.status}>
                    {book.status === 'success' ? 'Available' : 'Borrowed'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
