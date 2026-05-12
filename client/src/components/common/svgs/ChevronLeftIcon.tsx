import type { IconProps } from './types';

export function ChevronLeftIcon({ size = 16, className, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className={className} {...rest}>
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}
