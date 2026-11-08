import { whopOwnerRequest } from './whop-owner'

export async function findSavedProjectMethod(id: string, accountId: string) {
  if (!/^sint_[A-Za-z0-9]+$/.test(id)) return
  const setup = await whopOwnerRequest(`/setup_intents/${id}`)
  const { metadata } = setup
  const memberId = setup.member_id ?? setup.member?.id
  const methodId = setup.payment_method_id ?? setup.payment_method?.id
  if (
    setup.id !== id || setup.status !== 'succeeded' ||
    metadata?.source !== 'roofing_deposit_setup' ||
    typeof metadata.project !== 'string' || !metadata.project ||
    typeof metadata.customer_id !== 'string' || !/^user_[A-Za-z0-9]+$/.test(metadata.customer_id) ||
    typeof memberId !== 'string' || !/^mber_[A-Za-z0-9]+$/.test(memberId) ||
    typeof methodId !== 'string' || !/^payt_[A-Za-z0-9]+$/.test(methodId)
  ) return

  const member = await whopOwnerRequest(`/members/${memberId}`)
  if (
    member.id !== memberId || (member.account_id ?? member.company?.id) !== accountId ||
    (member.user_id ?? member.user?.id) !== metadata.customer_id
  ) return

  return { project: metadata.project, userId: metadata.customer_id, memberId, methodId }
}

export async function findPaidProjectDeposit(
  id: string,
  accountId: string,
  depositPlanId: string,
) {
  if (!/^pay_[A-Za-z0-9]+$/.test(id)) return
  const payment = await whopOwnerRequest(`/payments/${id}`)
  const { metadata } = payment
  if (
    payment.id !== id || payment.status !== 'paid' || payment.substatus !== 'succeeded' ||
    (payment.account_id ?? payment.company?.id) !== accountId ||
    // Pinned to 2026-10-24: payments carry plan_id; variant_id arrived with 2026-10-27-2.
    (payment.plan_id ?? payment.variant_id) !== depositPlanId ||
    // refunded_amount is a Money object ({ amount, currency }), null when nothing was refunded.
    payment.refunded_at || Number(payment.refunded_amount?.amount ?? 0) !== 0 ||
    metadata?.source !== 'roofing_project_deposit' ||
    typeof metadata.setup_intent_id !== 'string'
  ) return

  const setup = await findSavedProjectMethod(metadata.setup_intent_id, accountId)
  if (
    !setup || setup.project !== metadata.project || setup.userId !== metadata.customer_id ||
    setup.memberId !== (payment.member_id ?? payment.member?.id)
  ) return
  return setup
}
