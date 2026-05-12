import type { IconProps } from './types';

export function ChevronRightIcon({ size = 16, className, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className={className} {...rest}>
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}
