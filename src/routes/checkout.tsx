import { createFileRoute } from '@tanstack/react-router'
import { DepositCheckout } from '../components/deposit-checkout'
import { ServiceCheckout, validateCheckoutSearch } from '../components/service-checkout'

export const Route = createFileRoute('/checkout')({
  validateSearch: validateCheckoutSearch,
  component: CheckoutPage,
})

function CheckoutPage() {
  const search = Route.useSearch()
  const depositFlow = search.setup === 'returned' || search.service === 'deposit'
  return <main className="checkout-page wrap">
    <a href="/#services">← Back to services</a>
    {depositFlow
      ? <DepositCheckout key={search.setup_intent_id ?? 'setup'} setupId={search.setup_intent_id} />
      : <ServiceCheckout key={search.service ?? 'default'} service={search.service} />}
  </main>
}
