import type { IconProps } from './types';

export function MenuIcon({ size = 22, className, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className={className} {...rest}>
      <path d="M3 12h18M3 6h18M3 18h18" />
    </svg>
  );
}
