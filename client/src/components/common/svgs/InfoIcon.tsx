import type { IconProps } from './types';

export function InfoIcon({ size = 20, className, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className={className} {...rest}>
      <circle cx={12} cy={12} r={10} />
      <path d="M12 8h.01M12 12v4" />
    </svg>
  );
}
