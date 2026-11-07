import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect } from 'react'
import { EstimateForm } from '../components/estimate-form'
import { demoPlans } from '../demo-config'

export const Route = createFileRoute('/')({ component: Home })

const services = [
  { number: '01', plan: 'tuneUp', name: 'Emergency Roof & Leak Repair', text: 'From stubborn leaks to storm damage, get a clear look at what needs attention.', includes: ['Check visible leak and storm-damage areas.', 'Quote repairs for damaged shingles, flashing, or seals.', 'Explain when the damage calls for replacement.'] },
  { number: '02', plan: 'deposit', name: 'Complete Roof Replacement', text: 'A considered plan for a roof built to protect your home for years to come.', includes: ['Review material and ventilation options.', 'Explain tear-off, disposal, and installation scope.', 'Outline the proposed schedule and payment milestones.'] },
  { number: '03', plan: 'inspection', name: 'Certified Drone & Hail Inspections', text: 'A thorough assessment and straightforward next steps for your property.', includes: demoPlans.inspection.includes },
  { number: '04', plan: null, name: 'Seamless Gutters & Architectural Flashing', text: 'Help direct rainwater away from your roof, siding, and foundation.', includes: ['Assess drainage and downspout placement.', 'Review gutter and flashing condition.', 'Quote installation or repairs based on the property.'] },
] as const

function Home() {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const service = (entry.target as HTMLElement).dataset.service
        if (service) window.whop?.track('service_viewed', { service })
        observer.unobserve(entry.target)
      }
    }, { threshold: 0.5 })
    document.querySelectorAll('[data-service]').forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [])
  return (
    <main>
      <div className="demo-notice">DEMO TEMPLATE · Business details and pricing are illustrative</div>
      <header className="header wrap">
        <a className="brand" href="#top" aria-label="Summit Ridge Roofing home"><span className="brand-mark">▲</span><span>SUMMIT RIDGE<small>ROOFING CO.</small></span></a>
        <nav aria-label="Main navigation"><a href="#services">Services</a><a href="#pricing">Plans &amp; pricing</a><a href="#approach">Our approach</a><a href="#area">Service area</a><a href="#reviews">Reviews</a></nav>
        <a className="header-link" href="#contact">Get in touch <span>↗</span></a>
      </header>
      <section className="hero" id="top">
        <div className="wrap hero-content"><p className="eyebrow light">ROOFING BUILT AROUND YOU <span>✳</span></p><h1>A better roof.<br /><em>A better feeling.</em></h1><p className="hero-copy">Thoughtful roofing solutions and straightforward guidance for the place you call home.</p><a className="button button-light" href="#contact">Request an estimate <span>↗</span></a><div className="hero-foot"><span>REPAIR · REPLACEMENT · INSPECTION</span><span>SCROLL TO EXPLORE ↓</span></div></div>
      </section>
      <section className="intro wrap" id="approach"><p className="eyebrow">THE SUMMIT RIDGE APPROACH</p><div><h2>Good work starts with a <em>good conversation.</em></h2><p>Your roof is a big decision. We make it easier to understand the work, the options, and what comes next—without the guesswork.</p></div></section>
      <section className="services" id="services"><div className="wrap"><div className="section-heading"><div><p className="eyebrow">WHAT WE DO</p><h2>Protection for<br /><em>every season.</em></h2></div><p>Whether you need a small fix or a fresh start, we’ll help you find the right path forward.</p></div><div className="service-grid md:grid-cols-2 xl:grid-cols-4">
          {services.map(service => (
            <article className="service-card" data-service={service.name} key={service.number}>
              <span className="service-number">{service.number} / 04</span>
              <div className="service-icon" aria-hidden="true">⌁</div>
              <h3>{service.name}</h3>
              <p>{service.text}</p>
              <strong className="my-3">{service.plan === 'deposit' ? 'From $5,400 · $500 deposit' : service.plan === 'tuneUp' ? 'Repairs from $350 · tune-up $799' : service.plan === 'inspection' ? '$149 flat fee' : 'From $850 · custom estimate'}</strong>
              <ul className="my-3 list-disc space-y-1 pl-5">
                {service.includes.map(item => <li key={item}>{item}</li>)}
              </ul>
              <div className="mt-auto flex flex-wrap items-center gap-4 pt-5 text-sm font-bold">
                {service.plan &&
                  <Link className="button button-dark" to="/checkout" search={{ service: service.plan }}>
                    {service.plan === 'deposit' ? 'Pay $500 project deposit' : `Select & Pay $${demoPlans[service.plan].price}`}
                  </Link>}
                <a className="underline" href="#contact">Request an estimate ↗</a>
              </div>
            </article>
          ))}
        </div>
      </div></section>
      <section className="wrap py-20" id="pricing" aria-labelledby="pricing-heading">
        <p className="eyebrow">BOOK AND PAY THROUGH WHOP</p>
        <h2 id="pricing-heading">Fixed Plans &amp; Pricing</h2>
        <p className="mb-8">Book a fixed-price service or pay the deposit for an approved project.</p>
        <div className="service-grid">
          {(Object.keys(demoPlans) as (keyof typeof demoPlans)[]).map(key => {
            const plan = demoPlans[key]
            return (
            <article className="service-card" id={`plan-${key}`} key={key}>
              <h3>{plan.name}</h3>
              <strong className="my-3 text-xl">${plan.price}</strong>
              <ul className="my-3 list-disc space-y-1 pl-5">
                {plan.includes.map(item => <li key={item}>{item}</li>)}
              </ul>
              <p>{plan.scope}</p>
              <Link className="button button-dark mt-auto self-start" to="/checkout" search={{ service: key }}>
                Select &amp; Pay ${plan.price} via Whop
              </Link>
            </article>
          )})}
        </div>
      </section>
      <section className="wrap py-20" aria-labelledby="project-flow-heading">
        <p className="eyebrow">DEPOSIT → JOB → FINAL INVOICE</p>
        <h2 id="project-flow-heading">A clear path from booking to completion.</h2>
        <p>Approve your estimate, pay the $500 deposit, and reserve your crew and materials. After the job and final walkthrough, receive your itemized Whop invoice with the deposit deducted.</p>
        <p>Demo example: $5,000 approved project − $500 paid deposit = $4,500 final balance before applicable tax or approved changes. The $149 inspection credit applies once when included in your approved estimate.</p>
        <Link className="button button-dark" to="/checkout" search={{ service: 'deposit' }}>Pay $500 project deposit</Link>
      </section>
      <section className="area wrap" id="area"><div><p className="eyebrow">CLOSE TO HOME</p><h2>Rooted in the<br /><em>neighborhood.</em></h2></div><div><p>Our demo service area covers the Dallas-Fort Worth Metroplex and surrounding counties. Every home is different—tell us where you are and what you need.</p><div className="area-tags"><span>DALLAS</span><span>FORT WORTH</span><span>PLANO</span><span>FRISCO</span><span>MCKINNEY</span><span>ARLINGTON</span><span>IRVING</span><span>GARLAND</span><span>SOUTHLAKE</span><span>GRAPEVINE</span></div></div></section>
      <section className="financing"><div className="wrap financing-inner"><div><p className="eyebrow light">MORE WAYS TO PLAN</p><h2>Room to breathe.<br /><em>Options to move forward.</em></h2></div><p>Available payment and financing options are shown at checkout when offered by Whop and the merchant. Eligibility and terms apply.</p></div></section>
      <section className="contact wrap" id="reviews" aria-labelledby="reviews-heading">
        <p className="eyebrow">HOMEOWNER STORIES</p>
        <h2 id="reviews-heading">A better experience.<br /><em>From start to finish.</em></h2>
        <p>Illustrative demo reviews. Replace with customer-approved testimonials before using this template for a real business.</p>
        <div className="my-6 grid gap-4 text-left sm:grid-cols-3">
          <figure className="m-0 rounded border border-current/20 p-5">
            <p className="eyebrow">ROOF REPLACEMENT</p>
            <blockquote className="m-0">
              <p>“We paid the $500 deposit online, knew when the crew was coming, and received a clear final invoice after the walkthrough. The whole project felt easy to follow.”</p>
            </blockquote>
            <figcaption className="mt-4"><strong>Marcus V.</strong><br />Frisco, TX · Demo testimonial</figcaption>
          </figure>
          <figure className="m-0 rounded border border-current/20 p-5">
            <p className="eyebrow">DRONE &amp; ATTIC INSPECTION</p>
            <blockquote className="m-0">
              <p>“The inspection report helped us understand the storm damage and what needed attention. We appreciated having the $149 inspection fee credited toward our approved repair.”</p>
            </blockquote>
            <figcaption className="mt-4"><strong>Elena R.</strong><br />Plano, TX · Demo testimonial</figcaption>
          </figure>
          <figure className="m-0 rounded border border-current/20 p-5">
            <p className="eyebrow">ROOF TUNE-UP &amp; STORM SEAL</p>
            <blockquote className="m-0">
              <p>“The $799 package made it clear what was included before we booked. The technician replaced worn vent boots, sealed the flashing, and left everything tidy.”</p>
            </blockquote>
            <figcaption className="mt-4"><strong>David &amp; Sarah C.</strong><br />Dallas, TX · Demo testimonial</figcaption>
          </figure>
        </div>
      </section>
      <section className="contact wrap" id="contact"><p className="eyebrow">LET’S GET STARTED</p><h2>Let’s talk about<br /><em>your roof.</em></h2><EstimateForm /></section>
      <footer><div className="wrap footer-inner"><strong>SUMMIT RIDGE <span>ROOFING CO.</span></strong><p>Demo template · Dallas-Fort Worth, Texas</p><a href="#top">Back to top ↑</a></div></footer>
    </main>
  )
}
