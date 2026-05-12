import { useState, useMemo, useEffect, type ReactNode } from 'react';
import { ListingSearch } from './ListingSearch';
import { ListingSort, type SortOption } from './ListingSort';
import { ListingFilter, type FilterField } from './ListingFilter';
import { ListingPagination } from './ListingPagination';

/** Default `pageSize` when the prop is omitted */
export const DEFAULT_DATA_LISTING_PAGE_SIZE = 10;

function snapToAllowedPageSize(requested: number, allowed: number[]): number {
  if (allowed.length === 0) return DEFAULT_DATA_LISTING_PAGE_SIZE;
  if (allowed.includes(requested)) return requested;
  if (allowed.includes(DEFAULT_DATA_LISTING_PAGE_SIZE)) return DEFAULT_DATA_LISTING_PAGE_SIZE;
  return allowed[0];
}

// ─── Column definition ───────────────────────────────────────────────────────

export interface ListingColumn<T> {
  key: string;
  header: ReactNode;
  /** Custom cell renderer; falls back to `row[key]` */
  render?: (row: T, index: number) => ReactNode;
  /** Pass a compare function to enable column-level sorting */
  sortable?: boolean;
  /** Additional className for this column's th/td */
  className?: string;
  /** Minimum width (e.g. "120px") */
  minWidth?: string;
}

// ─── Props ───────────────────────────────────────────────────────────────────

export interface DataListingProps<T extends Record<string, unknown>> {
  /** Card/widget title */
  title?: ReactNode;
  /** Column definitions */
  columns: ListingColumn<T>[];
  /** Full dataset (client-side search/sort/page applied when no callbacks given) */
  data: T[];

  // Search
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Key(s) to match the search query against; defaults to all string fields */
  searchKeys?: (keyof T)[];

  // Sort
  sortOptions?: SortOption[];
  defaultSort?: string;

  // Filter
  filters?: FilterField[];

  // Pagination
  /** When false, all rows render and no footer pager is shown. Default true. */
  pagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];

  // Server-side mode: pass totalCount + handlers to take full control
  totalCount?: number;
  onSearchChange?: (q: string) => void;
  onSortChange?: (value: string) => void;
  onFilterChange?: (values: Record<string, string>) => void;
  onPageChange?: (page: number) => void;
  /** Server-side / callback when the user changes rows per page */
  onPageSizeChange?: (pageSize: number) => void;

  /** Extra controls placed on the right side of the toolbar */
  actions?: ReactNode;
  /** Shown when the (filtered) dataset is empty */
  emptyState?: ReactNode;

  /** When set, each body row is clickable and keyboard-activatable */
  onRowClick?: (row: T, index: number) => void;
  /** Stable React key per row; defaults to index */
  getRowKey?: (row: T, index: number) => string;

  /** Seeds filter dropdown values on mount. Use parent `key` when URL-derived filters change. */
  defaultFilterValues?: Record<string, string>;

  className?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function DataListing<T extends Record<string, unknown>>({
  title,
  columns,
  data,
  searchable = false,
  searchPlaceholder = 'Search…',
  searchKeys,
  sortOptions = [],
  defaultSort,
  filters = [],
  pagination = true,
  pageSize: initialPageSize = DEFAULT_DATA_LISTING_PAGE_SIZE,
  pageSizeOptions = [10, 20, 50, 100, 150, 200],
  totalCount,
  onSearchChange,
  onSortChange,
  onFilterChange,
  onPageChange,
  onPageSizeChange,
  actions,
  emptyState,
  onRowClick,
  getRowKey,
  defaultFilterValues = {},
  className = '',
}: DataListingProps<T>) {
  const isServer = onPageChange !== undefined || totalCount !== undefined;

  // ─── State ─────────────────────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState(defaultSort ?? sortOptions[0]?.value ?? '');
  const [filterValues, setFilterValues] = useState<Record<string, string>>(() => ({
    ...defaultFilterValues,
  }));
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(() =>
    snapToAllowedPageSize(initialPageSize, pageSizeOptions)
  );

  useEffect(() => {
    setPageSize(snapToAllowedPageSize(initialPageSize, pageSizeOptions));
  }, [initialPageSize, pageSizeOptions]);

  // ─── Handlers ──────────────────────────────────────────────────────────────
  function handleSearch(v: string) {
    setSearch(v);
    setPage(1);
    onSearchChange?.(v);
  }

  function handleSort(v: string) {
    setSort(v);
    setPage(1);
    onSortChange?.(v);
  }

  function handleFilter(id: string, value: string) {
    const next = { ...filterValues, [id]: value };
    setFilterValues(next);
    setPage(1);
    onFilterChange?.(next);
  }

  function handleFilterReset() {
    setFilterValues({});
    setPage(1);
    onFilterChange?.({});
  }

  function handlePage(p: number) {
    setPage(p);
    onPageChange?.(p);
  }

  function handlePageSizeChange(next: number) {
    setPageSize(next);
    setPage(1);
    onPageChange?.(1);
    onPageSizeChange?.(next);
  }

  // ─── Client-side data pipeline ─────────────────────────────────────────────
  const processed = useMemo<T[]>(() => {
    if (isServer) return data;

    let rows = [...data];

    // 1. Filter
    if (filters.length && Object.values(filterValues).some(Boolean)) {
      rows = rows.filter((row) =>
        Object.entries(filterValues).every(([id, val]) => {
          if (!val) return true;
          return String(row[id] ?? '').toLowerCase() === val.toLowerCase();
        })
      );
    }

    // 2. Search
    if (search.trim()) {
      const q = search.toLowerCase();
      const keys = searchKeys ?? (Object.keys(rows[0] ?? {}) as (keyof T)[]);
      rows = rows.filter((row) =>
        keys.some((k) => String(row[k] ?? '').toLowerCase().includes(q))
      );
    }

    // 3. Sort (matches SortOption.value pattern: "field-asc" / "field-desc")
    if (sort) {
      const [field, dir] = sort.split('-');
      rows = [...rows].sort((a, b) => {
        const av = String(a[field] ?? '');
        const bv = String(b[field] ?? '');
        const cmp = av.localeCompare(bv, undefined, { numeric: true });
        return dir === 'desc' ? -cmp : cmp;
      });
    }

    return rows;
  }, [data, search, sort, filterValues, filters, isServer, searchKeys]);

  // 4. Paginate (client-side)
  const total = totalCount ?? processed.length;
  const pageData = isServer
    ? data
    : pagination
      ? processed.slice((page - 1) * pageSize, page * pageSize)
      : processed;

  // ─── Render ────────────────────────────────────────────────────────────────
  const hasToolbar = searchable || sortOptions.length > 0 || filters.length > 0 || actions;

  return (
    <div className={`data-listing ${className}`}>
      {/* Header */}
      {(title || hasToolbar) && (
        <div className="data-listing-header">
          {title && <h3 className="data-listing-title">{title}</h3>}
          {hasToolbar && (
            <div className="data-listing-toolbar">
              <div className="data-listing-toolbar-left">
                {searchable && (
                  <ListingSearch
                    value={search}
                    onChange={handleSearch}
                    placeholder={searchPlaceholder}
                  />
                )}
                {filters.length > 0 && (
                  <ListingFilter
                    filters={filters}
                    values={filterValues}
                    onChange={handleFilter}
                    onReset={handleFilterReset}
                  />
                )}
              </div>
              <div className="data-listing-toolbar-right">
                {sortOptions.length > 0 && (
                  <ListingSort
                    options={sortOptions}
                    value={sort}
                    onChange={handleSort}
                  />
                )}
                {actions && <div className="data-listing-actions">{actions}</div>}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="data-listing-table-wrap tbl-scroll">
        <table className="tbl data-listing-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={col.className}
                  style={col.minWidth ? { minWidth: col.minWidth } : undefined}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="data-listing-empty">
                  {emptyState ?? 'No results found.'}
                </td>
              </tr>
            ) : (
              pageData.map((row, ri) => {
                const rowKey = getRowKey?.(row, ri) ?? String(ri);
                const interactive = onRowClick !== undefined;
                return (
                  <tr
                    key={rowKey}
                    className={interactive ? 'data-listing-row-clickable' : undefined}
                    onClick={interactive ? () => onRowClick(row, ri) : undefined}
                    onKeyDown={
                      interactive
                        ? (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              onRowClick(row, ri);
                            }
                          }
                        : undefined
                    }
                    tabIndex={interactive ? 0 : undefined}
                    role={interactive ? 'button' : undefined}
                  >
                    {columns.map((col) => (
                      <td key={col.key} className={col.className}>
                        {col.render
                          ? col.render(row, ri)
                          : (row[col.key] as ReactNode)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer / Pagination */}
      {pagination && (
        <ListingPagination
          page={page}
          pageSize={pageSize}
          pageSizeOptions={pageSizeOptions}
          total={total}
          onChange={handlePage}
          onPageSizeChange={handlePageSizeChange}
          className="data-listing-footer"
        />
      )}
    </div>
  );
}
