import { useRef, type ChangeEvent } from 'react';
import { SearchIcon, XIcon } from '../svgs';

export interface ListingSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function ListingSearch({
  value,
  onChange,
  placeholder = 'Search…',
  className = '',
}: ListingSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    onChange(e.target.value);
  }

  function handleClear() {
    onChange('');
    inputRef.current?.focus();
  }

  return (
    <div className={`listing-search ${className}`}>
      <span className="listing-search-icon" aria-hidden>
        <SearchIcon size={15} />
      </span>
      <input
        ref={inputRef}
        type="search"
        className="listing-search-input"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        aria-label={placeholder}
        autoComplete="off"
        spellCheck={false}
      />
      {value && (
        <button
          type="button"
          className="listing-search-clear"
          onClick={handleClear}
          aria-label="Clear search"
          tabIndex={0}
        >
          <XIcon size={13} />
        </button>
      )}
    </div>
  );
}
