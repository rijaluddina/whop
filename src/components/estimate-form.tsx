import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { estimateServices, roofAges } from '../demo-config'

export function EstimateForm() {
  const [status, setStatus] = useState('')
  const [sending, setSending] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const attempt = useRef<{ values: string; id: string } | undefined>(undefined)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (sending || submitted) return
    const values = Object.fromEntries(new FormData(event.currentTarget))
    const serialized = JSON.stringify(values)
    if (attempt.current?.values !== serialized) {
      attempt.current = { values: serialized, id: crypto.randomUUID() }
    }
    setSending(true)
    setStatus('')
    let leadId: string
    try {
      const response = await fetch('/api/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, requestId: attempt.current.id }),
      })
      if (response.status === 401) {
        setStatus('Sign in with Whop before sending your estimate request.')
        return
      }
      if (response.status === 400) {
        setStatus('Check your contact information, service, and project details.')
        return
      }
      if (!response.ok) throw new Error('Estimate failed')
      const result = await response.json()
      if (typeof result.leadId !== 'string') throw new Error('Missing lead ID')
      leadId = result.leadId
      setSubmitted(true)
      setStatus('Your estimate request was received.')
    } catch {
      setStatus('We could not confirm your request. Please try again.')
      return
    } finally {
      setSending(false)
    }
    window.whop?.track('lead', { event_id: leadId })
    window.whop?.track('estimate_requested', { event_id: leadId })
  }

  return (
    <form className="mx-auto mt-6 grid max-w-md gap-4 text-left" method="post" action="/api/estimate" onSubmit={submit}>
      <p className="text-sm">Sign in with Whop before sending your request.</p>
      <a className="underline" href="/auth/login">Sign in with Whop</a>
      <label className="grid gap-1">
        Full name
        <input className="rounded border p-2" name="name" autoComplete="name" required maxLength={100} />
      </label>
      <label className="grid gap-1">
        Contact email
        <input className="rounded border p-2" name="email" type="email" autoComplete="email" required maxLength={254} />
      </label>
      <label className="grid gap-1">
        Service needed
        <select className="rounded border p-2" name="service" defaultValue="" required>
          <option value="" disabled>Select a service</option>
          {estimateServices.map(service => <option key={service}>{service}</option>)}
        </select>
      </label>
      <label className="grid gap-1">
        Phone number
        <input className="rounded border p-2" name="phone" type="tel" autoComplete="tel" required maxLength={32} />
      </label>
      <label className="grid gap-1">
        Project ZIP code
        <input className="rounded border p-2" name="zip" autoComplete="postal-code" pattern="[0-9]{5}(-[0-9]{4})?" required />
      </label>
      <label className="grid gap-1">
        Street address
        <input className="rounded border p-2" name="address" autoComplete="street-address" maxLength={200} />
      </label>
      <label className="grid gap-1">
        Estimated roof age
        <select className="rounded border p-2" name="roofAge" defaultValue="I don't know">
          {roofAges.map(age => <option key={age}>{age}</option>)}
        </select>
      </label>
      <label className="flex items-start gap-2">
        <input type="checkbox" name="insuranceClaim" value="yes" />
        I have an insurance claim or need help with an adjuster review.
      </label>
      <label className="grid gap-1">
        Tell us about your project
        <textarea className="rounded border p-2" name="details" rows={4} required maxLength={1000} />
      </label>
      <button className="button button-dark" type="submit" disabled={sending || submitted}>
        {sending ? 'Sending…' : 'Request an estimate'}
      </button>
      <div role="status">{status}</div>
    </form>
  )
}
