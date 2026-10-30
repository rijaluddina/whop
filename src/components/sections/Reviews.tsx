import { useState, useCallback, useEffect } from 'react';
import { companyConfig } from '../../lib/config/company';
import { Section, Container, Badge, Card, CardContent } from '../ui';

export const Reviews = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const reviews = companyConfig.reviews;
  const trustBadges = companyConfig.trustBadges;

  const nextReview = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  }, [reviews.length]);

  const prevReview = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  }, [reviews.length]);

  const goToReview = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextReview, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextReview]);

  // Pause on hover
  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        nextReview();
      } else {
        prevReview();
      }
    }
    setTouchStartX(null);
  };

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          className={`w-5 h-5 ${i < rating ? 'text-[var(--color-secondary)]' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );

  return (
    <Section id="reviews" variant="default" size="xl" className="relative">
      <Container size="lg">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="primary" size="md" className="mb-4" dot>
            Customer Reviews
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-primary)] mb-4">
            Trusted by Homeowners Across Central Illinois
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            See what our customers have to say about their experience with {companyConfig.name}.
          </p>
        </div>

        {/* Reviews Carousel */}
        <div
          className="relative max-w-4xl mx-auto"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Carousel Track */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              role="list"
              aria-label="Customer reviews"
            >
              {reviews.map((review, index) => (
                <div key={index} className="w-full flex-shrink-0 px-4" role="listitem">
                  <Card variant="elevated" padding="lg" className="h-full">
                    <CardContent className="text-center">
                      {/* Stars */}
                      <div className="mb-4" aria-label="Rating">
                        {renderStars(review.rating)}
                      </div>

                      {/* Review Text */}
                      <blockquote className="text-lg text-gray-700 leading-relaxed mb-6 italic">
                        &ldquo;{review.text}&rdquo;
                      </blockquote>

                      {/* Author */}
                      <div className="flex flex-col items-center gap-1">
                        <cite className="font-semibold text-gray-900 not-italic">
                          {review.name}
                        </cite>
                        <time className="text-sm text-gray-500" dateTime={review.date}>
                          {new Date(review.date).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </time>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevReview}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 w-12 h-12 rounded-full bg-white border border-[var(--color-border)] flex items-center justify-center text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2"
            aria-label="Previous review"
            aria-hidden="true"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={nextReview}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 w-12 h-12 rounded-full bg-white border border-[var(--color-border)] flex items-center justify-center text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2"
            aria-label="Next review"
            aria-hidden="true"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dots Indicator */}
          <div
            className="flex justify-center gap-2 mt-8"
            role="tablist"
            aria-label="Review navigation"
          >
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => goToReview(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-[var(--color-primary)] w-8'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                role="tab"
                aria-selected={index === currentIndex}
                aria-label={`Go to review ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-[var(--color-primary)] mb-2">
              Licensed, Insured & Highly Rated
            </h3>
            <p className="text-gray-600">
              Our credentials speak to our commitment to quality and customer satisfaction
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            {trustBadges.map((badge) => (
              <Badge
                key={badge}
                variant="outline"
                size="lg"
                className="bg-white border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
              >
                <svg
                  className="w-4 h-4 text-[var(--color-success)] mr-1.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {badge}
              </Badge>
            ))}
          </div>

          {/* Google Reviews CTA - only show if Google link is configured */}
          {companyConfig.socialLinks.find((s) => s.icon === 'google') && (
            <div className="text-center mt-10">
              <a
                href={companyConfig.socialLinks.find((s) => s.icon === 'google')!.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white border-2 border-[var(--color-border)] text-gray-700 font-medium hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M21 7h-2v4h2c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2h-4v2h4c2.21 0 4-1.79 4-4V9c0-2.21-1.79-4-4-4zm-4 6h2v-2h-2v2zm4-6H9c-2.21 0-4 1.79-4 4v10c0 2.21 1.79 4 4 4h12c2.21 0 4-1.79 4-4V9c0-2.21-1.79-4-4-4z" />
                </svg>
                <span>Read All Google Reviews</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </a>
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
};

Reviews.displayName = 'Reviews';
