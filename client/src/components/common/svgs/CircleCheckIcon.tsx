import type { IconProps } from './types';

export function CircleCheckIcon({ size = 18, className, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className={className} {...rest}>
      <circle cx={12} cy={12} r={10} />
      <polyline points="9 12 11.5 14.5 16 9.5" />
    </svg>
  );
}
