export type BadgeVariant = 'primary' | 'accent' | 'success' | 'warning' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  primary: 'badge-primary',
  accent: 'badge-accent',
  success: 'badge-success',
  warning: 'badge-warning',
  neutral: 'badge-neutral',
};

export function Badge({ variant = 'primary', children, className = '' }: BadgeProps) {
  const classes = ['badge', variantClasses[variant], className].filter(Boolean).join(' ');
  return <span className={classes}>{children}</span>;
}
