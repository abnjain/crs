import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

export type ButtonVariant =
  | 'primary'
  | 'accent'
  | 'outline'
  | 'outline-accent'
  | 'ghost'
  | 'white'
  | 'white-outline';

export type ButtonSize = 'sm' | 'default' | 'lg';

interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
  'aria-label'?: string;
}

interface ButtonAsButton extends ButtonBaseProps {
  as?: 'button';
  onClick?: () => void;
  href?: never;
  to?: never;
}

interface ButtonAsLink extends ButtonBaseProps {
  as?: 'a';
  href: string;
  to?: never;
  onClick?: never;
}

interface ButtonAsNavLink extends ButtonBaseProps {
  as?: 'link';
  to: string;
  href?: never;
  onClick?: never;
}

export type ButtonProps = ButtonAsButton | ButtonAsLink | ButtonAsNavLink;

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  accent: 'btn-accent',
  outline: 'btn-outline',
  'outline-accent': 'btn-outline-accent',
  ghost: 'btn-ghost',
  white: 'btn-white',
  'white-outline': 'btn-white-outline',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'btn-sm',
  default: '',
  lg: 'btn-lg',
};

export function Button(props: ButtonProps) {
  const {
    variant = 'primary',
    size = 'default',
    children,
    className = '',
    disabled = false,
    type = 'button',
    ...rest
  } = props;

  const baseClass = 'btn';
  const variantClass = variantClasses[variant];
  const sizeClass = sizeClasses[size];
  const classes = [baseClass, variantClass, sizeClass, className].filter(Boolean).join(' ');

  if ('to' in props && props.to) {
    return (
      <Link to={props.to} className={classes} aria-disabled={disabled}>
        {children}
      </Link>
    );
  }

  if ('href' in props && props.href) {
    return (
      <a href={props.href} className={classes} {...rest}>
        {children}
      </a>
    );
  }

  if ('onClick' in props) {
    return (
      <button
        type={type}
        className={classes}
        disabled={disabled}
        onClick={props.onClick}
        {...rest}
      >
        {children}
      </button>
    );
  }

  return (
    <button type={type} className={classes} disabled={disabled} {...rest}>
      {children}
    </button>
  );
}
