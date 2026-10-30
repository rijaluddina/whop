import { useState, useEffect } from 'react';
import { companyConfig } from '../../lib/config/company';
import { Navigation } from './Navigation';

const SCROLL_THRESHOLD = 20;

export interface HeaderProps {
  className?: string;
}

export const Header = ({ className }: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  const getLogoAbbreviation = (name: string): string => {
    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
      // For single-word names, use first 2-3 characters
      return name.slice(0, 3).toUpperCase();
    }
    // For multi-word names, use first letter of each word
    return words
      .map((w) => w[0])
      .join('')
      .toUpperCase();
  };

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm' : 'bg-transparent'}
        ${className || ''}
      `}
      role="banner"
    >
      <div className="border-b border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0">
              <a
                href="#home"
                className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 rounded-lg"
                aria-label={`${companyConfig.name} - Home`}
              >
                <svg
                  className="w-8 h-8 text-[var(--color-primary)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="text-xl font-bold text-[var(--color-primary)] hidden sm:block">
                  {companyConfig.name}
                </span>
                <span className="text-lg font-bold text-[var(--color-primary)] sm:hidden">
                  {getLogoAbbreviation(companyConfig.name)}
                </span>
              </a>
            </div>

            {/* Desktop Navigation */}
            <Navigation className="hidden md:flex" onNavClick={handleNavClick} />

            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg text-gray-600 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 transition-colors"
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {isMobileMenuOpen ? (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden bg-white border-b border-[var(--color-border)] animate-slide-down"
          role="navigation"
          aria-label="Mobile navigation"
        >
          <div className="px-4 py-4 space-y-2">
            <Navigation className="flex flex-col space-x-0 space-y-1" onNavClick={handleNavClick} />
            <div className="pt-4 border-t border-[var(--color-border)] flex flex-col space-y-3">
              <a
                href={`tel:${companyConfig.phone}`}
                className="px-4 py-3 text-base font-medium text-[var(--color-primary)] bg-[var(--color-primary)]/10 rounded-lg text-center hover:bg-[var(--color-primary)]/20 transition-colors"
              >
                Call {companyConfig.phone}
              </a>
              <a
                href={`mailto:${companyConfig.email}`}
                className="px-4 py-3 text-base font-medium text-white bg-[var(--color-primary)] rounded-lg text-center hover:bg-[var(--color-primary)]/90 transition-colors"
              >
                Email Us
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

Header.displayName = 'Header';
