import { useState, useEffect, useCallback, useRef } from 'react';

export interface NavigationProps {
  className?: string;
  onNavClick?: () => void;
  sections?: string[];
  scrollOffset?: number;
}

const DEFAULT_SCROLL_OFFSET = 100;
const SCROLL_THROTTLE_MS = 16; // ~60fps

export const Navigation = ({
  className,
  onNavClick,
  sections = ['home', 'services', 'about', 'reviews', 'contact'],
  scrollOffset = DEFAULT_SCROLL_OFFSET,
}: NavigationProps) => {
  const [activeSection, setActiveSection] = useState<string>('home');
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isScrollingRef = useRef(false);

  const updateActiveSection = useCallback(() => {
    const scrollPosition = window.scrollY + scrollOffset;

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
  }, [sections, scrollOffset]);

  const throttledUpdateActiveSection = useCallback(() => {
    if (scrollTimeoutRef.current) return;
    scrollTimeoutRef.current = setTimeout(() => {
      updateActiveSection();
      scrollTimeoutRef.current = null;
    }, SCROLL_THROTTLE_MS);
  }, [updateActiveSection]);

  useEffect(() => {
    // Initial check
    updateActiveSection();

    window.addEventListener('scroll', throttledUpdateActiveSection, {
      passive: true,
    } as AddEventListenerOptions);

    return () => {
      window.removeEventListener('scroll', throttledUpdateActiveSection);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [throttledUpdateActiveSection, updateActiveSection]);

  const scrollToSection = useCallback(
    (sectionId: string) => {
      const element = document.getElementById(sectionId);
      if (element) {
        isScrollingRef.current = true;
        element.scrollIntoView({ behavior: 'smooth' });
        onNavClick?.();

        // Wait for scroll to complete before updating active section
        const handleScrollEnd = () => {
          isScrollingRef.current = false;
          setActiveSection(sectionId);
          window.removeEventListener('scroll', handleScrollEnd);
        };

        // Use a timeout as fallback since scrollend event isn't widely supported
        setTimeout(() => {
          if (isScrollingRef.current) {
            handleScrollEnd();
          }
        }, 1000);

        window.addEventListener('scroll', handleScrollEnd, {
          passive: true,
          once: true,
        } as AddEventListenerOptions);
      }
    },
    [onNavClick]
  );

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
            focus:ring-[var(--color-primary)]
            ${
              activeSection === item.id
                ? 'text-[var(--color-primary)] bg-[var(--color-primary)]/10'
                : 'text-gray-600 hover:text-[var(--color-primary)]'
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
