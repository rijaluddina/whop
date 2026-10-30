import { HTMLAttributes, forwardRef } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', size = 'md', dot, className, children, ...props }, ref) => {
    const variants = {
      default: 'bg-[var(--color-muted)]/10 text-[var(--color-muted)]',
      primary: 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]',
      secondary: 'bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]',
      success: 'bg-[var(--color-success)]/10 text-[var(--color-success)]',
      warning: 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]',
      danger: 'bg-[var(--color-danger)]/10 text-[var(--color-danger)]',
      outline: 'bg-transparent border border-[var(--color-border)] text-[var(--color-muted)]',
    };
    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
      lg: 'px-3 py-1.5 text-base',
    };
    const dotColors = {
      default: 'bg-[var(--color-muted)]',
      primary: 'bg-[var(--color-primary)]',
      secondary: 'bg-[var(--color-secondary)]',
      success: 'bg-[var(--color-success)]',
      warning: 'bg-[var(--color-warning)]',
      danger: 'bg-[var(--color-danger)]',
      outline: 'bg-[var(--color-muted)]',
    };
    const dotSizes = {
      sm: 'w-1.5 h-1.5',
      md: 'w-2 h-2',
      lg: 'w-2.5 h-2.5',
    };

    return (
      <span
        ref={ref}
        className={`
          inline-flex items-center gap-1.5 font-medium rounded-full
          ${variants[variant]} ${sizes[size]} ${className || ''}
        `}
        {...props}
      >
        {dot && (
          <span
            className={`${dotColors[variant]} ${dotSizes[size]} rounded-full`}
            aria-hidden="true"
          />
        )}
        {children}
      </span>
    );
  }
);
Badge.displayName = 'Badge';
