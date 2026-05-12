import { useState, useRef, useEffect, useLayoutEffect, useMemo, useCallback, useId } from 'react';
import type { ReactNode, KeyboardEvent as ReactKeyboardEvent } from 'react';

export interface DropdownOption {
  value: string;
  label: string;
  /** Optional metadata for search */
  searchText?: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  onChange: (value: string, option: DropdownOption) => void;
  placeholder?: string;
  /** Enable search/filter inside dropdown */
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Custom trigger (button/content) */
  trigger?: ReactNode;
  /** For accessibility — pairs with visible <label id="..."> above the trigger */
  ariaLabelledBy?: string;
  className?: string;
  disabled?: boolean;
}

export function Dropdown({
  options,
  value,
  onChange,
  placeholder = 'Select…',
  searchable = false,
  searchPlaceholder = 'Search…',
  trigger,
  className = '',
  disabled = false,
  ariaLabelledBy,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [flipUp, setFlipUp] = useState(false);
  /** Max height for the scrolling list region (viewport-constrained when open). */
  const [listMaxHeightPx, setListMaxHeightPx] = useState(280);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Array<HTMLLIElement | null>>([]);
  const resizeRafRef = useRef(0);
  const refineRafRef = useRef(0);
  const instanceId = useId();
  const activeOptionId =
    activeIndex >= 0 ? `dropdown-option-${instanceId}-${activeIndex}` : undefined;

  const selected = options.find((o) => o.value === value);
  const filtered = useMemo(() => {
    if (!searchable || !query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        (o.searchText && o.searchText.toLowerCase().includes(q))
    );
  }, [options, query, searchable]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [open]);

  useEffect(() => {
    if (!open) {
      setActiveIndex(-1);
      return;
    }
    if (filtered.length === 0) {
      setActiveIndex(-1);
      return;
    }
    const selectedIndex = filtered.findIndex((opt) => opt.value === value);
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
  }, [open, filtered, value]);

  useEffect(() => {
    if (!open || activeIndex < 0) return;
    optionRefs.current[activeIndex]?.scrollIntoView({ block: 'nearest' });
  }, [open, activeIndex]);

  const recalcPlacement = useCallback(() => {
    const triggerEl = triggerRef.current;
    if (!triggerEl) return;

    const margin = 8;
    const maxListPreferred = 320;
    /** Room for search strip + borders/padding outside the scrolling list */
    const nonListBlock = searchable ? 58 : 20;
    const triggerRect = triggerEl.getBoundingClientRect();
    const vh = window.innerHeight;
    const spaceBelow = vh - triggerRect.bottom - margin;
    const spaceAbove = triggerRect.top - margin;

    /** Flip when we'd rather use the taller viewport side (panel opens above). */
    const needsMoreThanBelow = spaceBelow < maxListPreferred + nonListBlock;
    const upward =
      needsMoreThanBelow &&
      spaceAbove >= spaceBelow &&
      spaceAbove > margin * 2;

    const slot = upward ? spaceAbove : spaceBelow;
    const listCap = Math.min(maxListPreferred, Math.max(72, slot - nonListBlock));

    setFlipUp(upward);
    setListMaxHeightPx((prev) => (Math.abs(prev - listCap) > 1 ? listCap : prev));

    /** After paint: align flip + clamp with measured panel vs viewport gaps */
    cancelAnimationFrame(refineRafRef.current);
    refineRafRef.current = requestAnimationFrame(() => {
      refineRafRef.current = 0;
      const p = panelRef.current;
      const t = triggerRef.current;
      if (!p || !t) return;

      const innerH = window.innerHeight;
      const tr = t.getBoundingClientRect();
      const spaceBelowPanel = innerH - tr.bottom - margin;
      const spaceAbovePanel = tr.top - margin;
      const ph = p.getBoundingClientRect().height;

      const up =
        ph > spaceBelowPanel + 2 &&
        spaceAbovePanel >= spaceBelowPanel &&
        spaceAbovePanel > margin * 2;

      const slot = up ? spaceAbovePanel : spaceBelowPanel;
      const refined = Math.min(maxListPreferred, Math.max(72, slot - nonListBlock));

      setFlipUp(up);
      setListMaxHeightPx((prev) => (Math.abs(prev - refined) > 1 ? refined : prev));
    });
  }, [searchable]);

  useLayoutEffect(() => {
    if (!open) {
      cancelAnimationFrame(refineRafRef.current);
      cancelAnimationFrame(resizeRafRef.current);
      setFlipUp(false);
      return;
    }
    recalcPlacement();
    const onRelayout = () => {
      cancelAnimationFrame(resizeRafRef.current);
      resizeRafRef.current = requestAnimationFrame(() => {
        resizeRafRef.current = 0;
        recalcPlacement();
      });
    };
    window.addEventListener('resize', onRelayout);
    window.addEventListener('scroll', onRelayout, true);
    return () => {
      cancelAnimationFrame(resizeRafRef.current);
      cancelAnimationFrame(refineRafRef.current);
      window.removeEventListener('resize', onRelayout);
      window.removeEventListener('scroll', onRelayout, true);
    };
  }, [open, searchable, filtered.length, query, recalcPlacement]);

  const handleSelect = (opt: DropdownOption) => {
    onChange(opt.value, opt);
    setOpen(false);
    setQuery('');
  };

  const moveActive = useCallback(
    (delta: number) => {
      setActiveIndex((prev) => {
        if (filtered.length === 0) return -1;
        if (prev === -1) return delta < 0 ? filtered.length - 1 : 0;
        return (prev + delta + filtered.length) % filtered.length;
      });
    },
    [filtered.length]
  );

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLButtonElement | HTMLInputElement>) => {
      const isInput = event.currentTarget instanceof HTMLInputElement;
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          if (!open) setOpen(true);
          moveActive(1);
          break;
        case 'ArrowUp':
          event.preventDefault();
          if (!open) setOpen(true);
          moveActive(-1);
          break;
        case 'Home':
          if (!isInput && filtered.length > 0) {
            event.preventDefault();
            if (!open) setOpen(true);
            setActiveIndex(0);
          }
          break;
        case 'End':
          if (!isInput && filtered.length > 0) {
            event.preventDefault();
            if (!open) setOpen(true);
            setActiveIndex(filtered.length - 1);
          }
          break;
        case 'Enter':
        case ' ': {
          if (event.key === ' ' && isInput) break;
          if (!open) break;
          event.preventDefault();
          if (activeIndex >= 0 && activeIndex < filtered.length) {
            handleSelect(filtered[activeIndex]);
          }
          break;
        }
        case 'Escape':
          if (open) {
            event.preventDefault();
            setOpen(false);
          }
          break;
        default:
          break;
      }
    },
    [activeIndex, filtered, handleSelect, moveActive, open]
  );

  return (
    <div className={`dropdown ${className}`} ref={containerRef}>
      <button
        type="button"
        ref={triggerRef}
        className="dropdown-trigger"
        aria-labelledby={ariaLabelledBy}
        aria-controls={`dropdown-list-${instanceId}`}
        aria-activedescendant={open ? activeOptionId : undefined}
        onClick={() => !disabled && setOpen(!open)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {trigger ?? (
          <span className="dropdown-trigger-text">
            {selected?.label ?? placeholder}
          </span>
        )}
        <svg
          width={14}
          height={14}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
          style={{
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform var(--transition-fast)',
          }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div
          ref={panelRef}
          className={`dropdown-panel${flipUp ? ' dropdown-panel--flip' : ''}`}
        >
          {searchable && (
            <div className="dropdown-search-wrap">
              <input
                type="text"
                className="dropdown-search"
                placeholder={searchPlaceholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                aria-label="Search options"
                aria-controls={`dropdown-list-${instanceId}`}
                aria-activedescendant={open ? activeOptionId : undefined}
              />
            </div>
          )}
          <ul
            className="dropdown-list"
            style={{ maxHeight: listMaxHeightPx }}
            role="listbox"
            id={`dropdown-list-${instanceId}`}
          >
            {filtered.length === 0 ? (
              <li className="dropdown-empty">No matches</li>
            ) : (
              filtered.map((opt, index) => (
                <li
                  key={opt.value}
                  id={`dropdown-option-${instanceId}-${index}`}
                  ref={(el) => {
                    optionRefs.current[index] = el;
                  }}
                  className={`dropdown-item${opt.value === value ? ' selected' : ''}${index === activeIndex ? ' active' : ''}`}
                  role="option"
                  aria-selected={opt.value === value}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => handleSelect(opt)}
                >
                  {opt.label}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
