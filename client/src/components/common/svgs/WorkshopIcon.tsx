import type { IconProps } from './types';

export function WorkshopIcon({ size = 72, className, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth={size > 24 ? 0.8 : 1.8} viewBox="0 0 24 24" className={className} {...rest}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    </svg>
  );
}
