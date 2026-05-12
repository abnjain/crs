import type { IconProps } from './types';

export function ChevronDownIcon({ size = 12, className, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" className={className} {...rest}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
