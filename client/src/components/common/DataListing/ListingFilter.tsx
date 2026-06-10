import {
  useMemo,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { Dropdown } from '../Dropdown';
import { XIcon } from '../svgs';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterField {
  id: string;
  label: string;
  options: FilterOption[];
}

export interface ListingFilterProps {
  filters: FilterField[];
  values: Record<string, string>;
  onChange: (id: string, value: string) => void;
  onReset: () => void;
  /** Extra trigger content if you want a custom button label */
  triggerLabel?: ReactNode;
  className?: string;
}

function optionListForField(field: FilterField): FilterOption[] {
  return field.options.some((opt) => opt.value === '')
    ? field.options
    : [{ value: '', label: 'All' }, ...field.options];
}

export function ListingFilter({
  filters,
  values,
  onChange,
  onReset,
  triggerLabel = 'Filter',
  className = '',
}: ListingFilterProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const activeCount = Object.values(values).filter(Boolean).length;

  const applied = useMemo(() => {
    const items: { id: string; fieldLabel: string; valueLabel: string }[] = [];
    for (const field of filters) {
      const raw = (values[field.id] ?? '').trim();
      if (!raw) continue;
      const opts = optionListForField(field);
      const opt = opts.find((o) => o.value === raw);
      items.push({
        id: field.id,
        fieldLabel: field.label,
        valueLabel: opt?.label ?? raw,
      });
    }
    return items;
  }, [filters, values]);

  useLayoutEffect(() => {
    if (!open) return undefined;

    const wrap = containerRef.current;
    const panel = panelRef.current;
    if (!wrap || !panel) return undefined;

    const positionPanel = () => {
      const w = containerRef.current;
      const p = panelRef.current;
      if (!w || !p) return;

      const r = w.getBoundingClientRect();
      const margin = 8;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const pw = p.getBoundingClientRect().width;
      const left = Math.min(Math.max(margin, r.left), vw - pw - margin);

      const ph = p.offsetHeight;
      const spaceAbove = r.top - margin;
      const spaceBelow = vh - r.bottom - margin;

      let top = r.top - margin;
      let transform = 'translateY(-100%)';

      /** Prefer above the trigger; open downward only if it does not fit above */
      if (ph + margin > spaceAbove && ph + margin <= spaceBelow) {
        top = r.bottom + margin;
        transform = 'none';
      }

      if (transform === 'none') {
        top = Math.max(margin, Math.min(top, vh - ph - margin));
      }

      p.style.left = `${left}px`;
      p.style.top = `${top}px`;
      p.style.transform = transform;
    };

    positionPanel();
    let raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(positionPanel);
    });

    window.addEventListener('resize', positionPanel);
    window.addEventListener('scroll', positionPanel, true);
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(positionPanel) : null;
    ro?.observe(panel);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', positionPanel);
      window.removeEventListener('scroll', positionPanel, true);
      ro?.disconnect();
      panel.style.left = '';
      panel.style.top = '';
      panel.style.transform = '';
    };
  }, [open, filters.length, activeCount]);

  useEffect(() => {
    if (!open) return;
    const handlePointer = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (containerRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('touchstart', handlePointer);
    document.addEventListener('keydown', handleKeydown);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('touchstart', handlePointer);
      document.removeEventListener('keydown', handleKeydown);
    };
  }, [open]);

  const panel =
    open &&
    typeof document !== 'undefined' &&
    createPortal(
      <div
        ref={panelRef}
        id={panelId}
        className="listing-filter-panel listing-filter-panel--portal"
        role="group"
        aria-label="Filters"
      >
        <div className="listing-filter-panel-header">
          <span className="listing-filter-panel-title">Filters</span>
          <button
            type="button"
            className="listing-filter-panel-close"
            onClick={() => setOpen(false)}
            aria-label="Close filters"
          >
            <XIcon size={12} />
          </button>
        </div>
        <div className="listing-filter-panel-inner">
          {filters.map((field) => {
            const options = optionListForField(field);

            return (
              <div key={field.id} className="listing-filter-field">
                <label id={`filter-${field.id}-label`} className="listing-filter-field-label">
                  {field.label}
                </label>
                <div onMouseDown={(e) => e.stopPropagation()}>
                  <Dropdown
                    className="dropdown--listing-filter"
                    options={options}
                    value={values[field.id] ?? ''}
                    onChange={(value) => onChange(field.id, value)}
                    ariaLabelledBy={`filter-${field.id}-label`}
                    placeholder="All"
                  />
                </div>
              </div>
            );
          })}
        </div>
        {activeCount > 0 && (
          <div className="listing-filter-panel-footer">
            <div onMouseDown={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="listing-filter-reset"
            onClick={() => {
              onReset();
              setOpen(false);
            }}
          >
            <XIcon size={12} />
            Clear filters
          </button>
        </div>
          </div>
        )}
      </div>,
      document.body
    );

  return (
    <div className={`listing-filter ${className}`} ref={containerRef}>
      <div className="listing-filter-row">
        <button
          type="button"
          className={`listing-filter-btn ${activeCount > 0 ? 'listing-filter-btn--active' : ''}`}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
        >
          {/* Filter icon */}
          <svg
            width={14}
            height={14}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          <span>{triggerLabel}</span>
          {activeCount > 0 && (
            <span className="listing-filter-badge" aria-label={`${activeCount} active filters`}>
              {activeCount}
            </span>
          )}
        </button>

        {applied.length > 0 && (
          <ul className="listing-filter-applied" aria-label="Applied filters">
            {applied.map((item) => (
              <li key={item.id}>
                <span className="listing-filter-chip" title={`${item.fieldLabel}: ${item.valueLabel}`}>
                  <span className="listing-filter-chip-meta">{item.fieldLabel}</span>
                  <span className="listing-filter-chip-sep" aria-hidden>
                    ·
                  </span>
                  <span className="listing-filter-chip-value">{item.valueLabel}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {panel}
    </div>
  );
}
