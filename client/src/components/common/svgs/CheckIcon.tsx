import type { IconProps } from './types';

export function CheckIcon({ size = 18, className, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" className={className} {...rest}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
