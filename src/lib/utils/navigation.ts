// src/lib/utils/navigation.ts
// Simple navigation utility that can be swapped for router later

/**
 * Navigate to a path using window.location.href
 * This can be replaced with a router navigation function later
 */
export function navigate(path: string): void {
  if (typeof window !== 'undefined') {
    window.location.href = path;
  }
}

/**
 * Navigate to checkout with a plan parameter
 */
export function navigateToCheckout(planKey: string): void {
  navigate(`/checkout?plan=${planKey}`);
}

/**
 * Scroll to an element by ID
 */
export function scrollToElement(elementId: string): void {
  if (typeof window !== 'undefined') {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

/**
 * Scroll to contact section and optionally set service type
 */
export function scrollToContact(serviceType?: string): void {
  scrollToElement('contact');
  if (serviceType && typeof window !== 'undefined') {
    setTimeout(() => {
      const select = document.getElementById('service-type') as HTMLSelectElement | null;
      if (select) {
        select.value = serviceType;
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, 500);
  }
}
