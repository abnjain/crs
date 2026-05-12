import type { IconProps } from './types';

export function StatusDotIcon({ size = 12, className, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" className={className} {...rest}>
      <circle cx={6} cy={6} r={5} fill="var(--primary)" />
      <circle cx={6} cy={6} r={3} fill="white" />
    </svg>
  );
}
