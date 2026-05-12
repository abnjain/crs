import { Dropdown } from '../Dropdown';

export interface SortOption {
  value: string;
  label: string;
}

export interface ListingSortProps {
  options: SortOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function ListingSort({ options, value, onChange, className = '' }: ListingSortProps) {
  return (
    <div className={`listing-sort ${className}`}>
      <label className="listing-sort-label" id="listing-sort-label">
        Sort
      </label>
      <Dropdown
        className="dropdown--listing-sort"
        options={options}
        value={value}
        onChange={(nextValue) => onChange(nextValue)}
        ariaLabelledBy="listing-sort-label"
      />
    </div>
  );
}
