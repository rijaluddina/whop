import { HTMLAttributes, forwardRef } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', size = 'md', dot, className, children, ...props }, ref) => {
    const variants = {
      default: 'bg-gray-100 text-gray-800',
      primary: 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]',
      secondary: 'bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]',
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      danger: 'bg-red-100 text-red-800',
      outline: 'bg-transparent border border-gray-300 text-gray-700',
    };
    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
      lg: 'px-3 py-1.5 text-base',
    };
    const dotColors = {
      default: 'bg-gray-400',
      primary: 'bg-[var(--color-primary)]',
      secondary: 'bg-[var(--color-secondary)]',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      danger: 'bg-red-500',
      outline: 'bg-gray-400',
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
