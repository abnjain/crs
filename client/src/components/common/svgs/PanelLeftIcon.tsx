import type { IconProps } from './types';

export function PanelLeftIcon({ size = 20, className, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className={className} {...rest}>
      <rect x={3} y={3} width={7} height={18} rx={1} />
      <path d="M15 3v18" />
    </svg>
  );
}
