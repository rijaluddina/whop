import { useState } from 'react'
import { demoPlans } from '../demo-config'
import { ServiceCheckout } from './service-checkout'

export function DepositCheckout({ setupId }: { setupId?: string }) {
  const [configurationId, setConfigurationId] = useState<string>()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  async function openCheckout() {
    if (!setupId || pending) return
    setPending(true)
    setError('')
    try {
      const response = await fetch('/api/project-deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setupId }),
      })
      if (response.status === 401) {
        setError('Sign in with Whop and restart payment setup.')
        return
      }
      if (!response.ok) throw new Error('Deposit setup could not be verified')
      const result = await response.json()
      if (typeof result.configurationId !== 'string' || !/^ch_[A-Za-z0-9]+$/.test(result.configurationId)) {
        throw new Error('Invalid checkout configuration')
      }
      setConfigurationId(result.configurationId)
      window.whop?.track('deposit_started', {
        event_id: result.configurationId,
        variant_id: demoPlans.deposit.id,
      })
    } catch {
      setError('Whop could not verify payment setup. Retry or restart setup below.')
    } finally {
      setPending(false)
    }
  }

  if (configurationId) return <ServiceCheckout service="deposit" configurationId={configurationId} />

  return <section className="mx-auto mt-12 max-w-3xl">
    <h2>Project deposit · ${demoPlans.deposit.price}</h2>
    <p>For an approved project, save a payment method in Whop and then pay the deposit. The deposit goes toward your project total, and the remaining balance is invoiced after the work is complete.</p>
    {setupId && <button className="button button-dark" type="button" disabled={pending} onClick={openCheckout}>
      {pending ? 'Verifying setup…' : `Open $${demoPlans.deposit.price} deposit checkout`}
    </button>}
    {error && <p role="status">{error}</p>}
    <p className="mt-6"><a className="underline" href="/auth/login?returnTo=%2Fcheckout%3Fservice%3Ddeposit">Sign in with Whop</a> before starting payment setup.</p>
    <form method="post" action="/api/deposit-setup" className="mt-4 grid gap-4">
      <label>Project reference <input className="rounded border p-2" name="project" required maxLength={100} /></label>
      <label><input type="checkbox" name="consent" value="yes" required /> I agree to save a payment method with Whop for this project’s final invoice.</label>
      <button className="button button-dark justify-self-start" type="submit">Continue to Whop payment setup</button>
    </form>
  </section>
}
