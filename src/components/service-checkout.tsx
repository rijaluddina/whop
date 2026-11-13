import { useEffect, useState } from 'react'
import { loadWhop } from '@whop/elements'
import { Checkout, CheckoutElement, WhopElements } from '@whop/elements-react'
import { demoPlans, legacyGutterPlan } from '../demo-config'
import { whopEnvironment } from '../whop-environment'

const plans = {
  repair: demoPlans.tuneUp,
  replacement: {
    name: 'Roof replacement',
    id: whopEnvironment === 'sandbox'
      ? import.meta.env.VITE_WHOP_SANDBOX_ROOF_REPLACEMENT_PLAN_ID
      : import.meta.env.VITE_WHOP_ROOF_REPLACEMENT_PLAN_ID,
  },
  inspection: demoPlans.inspection,
  deposit: demoPlans.deposit,
  gutterCleaning: legacyGutterPlan,
  tuneUp: demoPlans.tuneUp,
}

type Service = keyof typeof plans

export function validateCheckoutSearch(search: Record<string, unknown>): { service?: Service | null; setup_intent_id?: string; setup?: string } {
  const { service, setup_intent_id: setupId } = search
  if (search.setup === 'returned' || service === 'deposit') {
    return { service: search.setup === 'returned' && service === undefined ? undefined : 'deposit', setup: search.setup === 'returned' ? 'returned' : undefined, setup_intent_id: typeof setupId === 'string' && /^sint_[A-Za-z0-9]+$/.test(setupId) ? setupId : undefined }
  }
  if (service === 'repair' || service === 'replacement' || service === 'inspection' || service === 'gutterCleaning' || service === 'tuneUp') {
    return { service }
  }
  return service === undefined && search.setup === undefined ? {} : { service: null }
}

const whopElements = loadWhop()

export function ServiceCheckout({ service = 'inspection', configurationId }: { service?: Service | null; configurationId?: string }) {
  const [paymentId, setPaymentId] = useState<string>()
  useEffect(() => {
    if (service === 'deposit' && !configurationId) {
      window.whop?.track('deposit_started', { variant_id: demoPlans.deposit.id })
    }
  }, [service, configurationId])
  if (service === null) {
    return <p className="mt-12">This checkout is unavailable. <a className="underline" href="/#services">Choose a service</a>.</p>
  }
  const plan = plans[service]

  return <section aria-labelledby="service-checkout-heading" className="mx-auto mt-12 max-w-3xl">
    <h2 id="service-checkout-heading">{plan.name}</h2>
    {'includes' in plan && <>
      <ul className="my-3 list-disc space-y-1 pl-5">
        {plan.includes.map(item => <li key={item}>{item}</li>)}
      </ul>
      <p className="mb-6">{plan.scope}</p>
    </>}
    {paymentId ? <p role="status">Payment confirmed by Whop. Payment reference: {paymentId}</p> :
      typeof plan.id === 'string' && /^plan_[A-Za-z0-9]+$/.test(plan.id) ? (
        <WhopElements elements={whopElements} environment={whopEnvironment}>
          <Checkout {...(configurationId ? { checkoutConfiguration: configurationId } : { plan: plan.id })}
            appearance={{ classes: {
              'whop-CheckoutLayout': { flexDirection: 'column', width: '100%', minWidth: '0px' },
              'whop-CheckoutDetails': { width: '100%', minWidth: '0px', position: 'static', height: 'auto', padding: '16px' },
              'whop-CheckoutCollection': { width: '100%', minWidth: '0px', padding: '16px' },
              'whop-CheckoutSummary': { width: '100%', minWidth: '0px' },
              'whop-CheckoutTotal': { maxWidth: '100%', whiteSpace: 'normal', overflowWrap: 'anywhere' },
            } }} onComplete={completion => {
            if (completion.result !== 'payment') return
            setPaymentId(completion.paymentId)
            window.whop?.track('checkout_completed', {
              event_id: completion.paymentId,
              payment_id: completion.paymentId,
              checkout_session_id: completion.sessionId,
              variant_id: plan.id,
            })
          }}>
            <CheckoutElement />
          </Checkout>
        </WhopElements>
      ) : <p>Online payment for this service is unavailable. <a className="underline" href="/#contact">Request an estimate</a>.</p>}
  </section>
}
