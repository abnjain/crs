import { useId } from 'react';
import { Dropdown } from '../Dropdown';
import { ChevronLeftIcon, ChevronRightIcon } from '../svgs';

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 150, 200];

export interface ListingPaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
  pageSizeOptions?: number[];
  onPageSizeChange?: (pageSize: number) => void;
  /** How many page buttons to show around the current page; default 1 */
  siblingCount?: number;
  className?: string;
}

function range(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export function ListingPagination({
  page,
  pageSize,
  total,
  onChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  onPageSizeChange,
  siblingCount = 1,
  className = '',
}: ListingPaginationProps) {
  const pageSizeLabelId = useId();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = Math.min((page - 1) * pageSize + 1, total);
  const to = Math.min(page * pageSize, total);

  // Still show footer when everything fits one page so range + rows-per-page stay visible.
  if (total === 0) return null;

  // Build page number list with ellipsis
  const DOTS = 'dots' as const;
  function buildPages(): (number | typeof DOTS)[] {
    const left = Math.max(2, page - siblingCount);
    const right = Math.min(totalPages - 1, page + siblingCount);
    const pages: (number | typeof DOTS)[] = [1];
    if (left > 2) pages.push(DOTS);
    pages.push(...range(left, right));
    if (right < totalPages - 1) pages.push(DOTS);
    if (totalPages > 1) pages.push(totalPages);
    return pages;
  }

  const pages = buildPages();

  const sizeDropdownOptions = pageSizeOptions.map((n) => ({
    value: String(n),
    label: String(n),
  }));
  const showPageSize =
    onPageSizeChange !== undefined && pageSizeOptions.length > 1;

  return (
    <div className={`listing-pagination ${className}`}>
      <div className="listing-pagination-meta">
        <span className="listing-pagination-info">
          {total === 0 ? 'No results' : `${from}–${to} of ${total}`}
        </span>
        {showPageSize && (
          <div className="listing-pagination-page-size">
            <span className="sr-only" id={pageSizeLabelId}>
              Rows per page
            </span>
            <Dropdown
              options={sizeDropdownOptions}
              value={String(pageSize)}
              onChange={(v) => onPageSizeChange(Number(v))}
              ariaLabelledBy={pageSizeLabelId}
              className="listing-pagination-page-size-dropdown"
            />
          </div>
        )}
      </div>

      <nav className="listing-pagination-nav" aria-label="Pagination">
        <button
          type="button"
          className="listing-page-btn"
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeftIcon size={14} />
        </button>

        {pages.map((p, i) =>
          p === DOTS ? (
            <span key={`dots-${i}`} className="listing-page-dots" aria-hidden>
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              className={`listing-page-btn ${p === page ? 'listing-page-btn--active' : ''}`}
              onClick={() => onChange(p)}
              aria-label={`Page ${p}`}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </button>
          )
        )}

        <button
          type="button"
          className="listing-page-btn"
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          <ChevronRightIcon size={14} />
        </button>
      </nav>
    </div>
  );
}
