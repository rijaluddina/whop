import { HTMLAttributes, forwardRef } from 'react';

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  variant?: 'default' | 'alternate' | 'dark';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
}

export const Section = forwardRef<HTMLElement, SectionProps>(
  ({ variant = 'default', size = 'lg', fullWidth = false, className, children, ...props }, ref) => {
    const variants = {
      default: 'bg-[var(--color-background)]',
      alternate: 'bg-[var(--color-surface)]',
      dark: 'bg-[var(--color-dark-bg)] text-[var(--color-dark-text)]',
    };
    const sizes = {
      sm: 'py-12 sm:py-16',
      md: 'py-16 sm:py-20',
      lg: 'py-20 sm:py-24 lg:py-28',
      xl: 'py-24 sm:py-28 lg:py-32',
    };
    const containerSizes = {
      sm: 'max-w-3xl',
      md: 'max-w-5xl',
      lg: 'max-w-7xl',
      xl: 'max-w-[90rem]',
    };

    return (
      <section
        ref={ref}
        className={`${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className || ''}`}
        {...props}
      >
        {!fullWidth && (
          <div className={`mx-auto px-4 sm:px-6 lg:px-8 w-full ${containerSizes[size]}`}>
            {children}
          </div>
        )}
        {fullWidth && <div className="px-4 sm:px-6 lg:px-8">{children}</div>}
      </section>
    );
  }
);
Section.displayName = 'Section';
