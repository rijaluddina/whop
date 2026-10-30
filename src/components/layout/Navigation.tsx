import { useState, useEffect } from 'react';

export interface NavigationProps {
  className?: string;
  onNavClick?: () => void;
}

export const Navigation = ({ className, onNavClick }: NavigationProps) => {
  const [activeSection, setActiveSection] = useState<string>('home');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'services', 'about', 'contact', 'reviews'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
      onNavClick?.();
    }
  };

  const navItems = [
    { id: 'services', label: 'Services' },
    { id: 'about', label: 'About' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <nav
      className={`flex items-center space-x-1 md:space-x-6 ${className || ''}`}
      role="navigation"
      aria-label="Main navigation"
    >
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => scrollToSection(item.id)}
          className={`
            px-3 py-2 text-sm font-medium rounded-lg transition-colors
            focus:outline-none focus:ring-2 focus:ring-offset-2
            ${
              activeSection === item.id
                ? 'text-[var(--color-primary)] bg-[var(--color-primary)]/10'
                : 'text-gray-600 hover:text-[var(--color-primary)]'
            }
            ${
              activeSection === item.id
                ? 'focus:ring-[var(--color-primary)]'
                : 'focus:ring-[var(--color-primary)]'
            }
          `}
          aria-current={activeSection === item.id ? 'page' : undefined}
        >
          {item.label}
        </button>
      ))}
      <button
        onClick={() => scrollToSection('contact')}
        className="ml-2 md:ml-4 px-5 py-2.5 text-base font-medium text-white bg-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary)]/90 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 transition-colors whitespace-nowrap"
      >
        Get a Quote
      </button>
    </nav>
  );
};

Navigation.displayName = 'Navigation';
