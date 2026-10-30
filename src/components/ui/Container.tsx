import { HTMLAttributes, forwardRef, ElementType } from 'react';

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  as?: ElementType;
}

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ size = 'lg', as: Component = 'div', className, children, ...props }, ref) => {
    const sizes = {
      sm: 'max-w-3xl',
      md: 'max-w-5xl',
      lg: 'max-w-7xl',
      xl: 'max-w-[90rem]',
      full: 'max-w-full',
    };
    return (
      <Component
        ref={ref}
        className={`mx-auto px-4 sm:px-6 lg:px-8 w-full ${sizes[size]} ${className || ''}`}
        {...props}
      >
        {children}
      </Component>
    );
  }
);
Container.displayName = 'Container';
