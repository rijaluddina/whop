export type EstimateSummary = {
  name: string
  service: string
  zip: string
  address?: string
  roofAge?: string
  insuranceClaim?: boolean
}

// Direct booking is only offered where a live plan exists. The retired gutter
// plan stays unadvertised (see demo-config.ts), so gutter requests get no
// checkout link.
const bookingLinks: Record<string, { path: string; label: string }> = {
  'Complete Roof Replacement': { path: '/checkout?service=deposit', label: 'Reserve your project — $500 deposit' },
  'Emergency Roof & Leak Repair': { path: '/checkout?service=repair', label: 'Book the flat-rate tune-up — $799' },
  'Certified Drone & Hail Inspections': { path: '/checkout?service=inspection', label: 'Book the 21-point inspection — $149' },
}

function escapeHtml(value: string): string {
  const amp = String.fromCharCode(38)
  const entities: Record<string, string> = {
    [amp]: `${amp}amp;`,
    '<': `${amp}lt;`,
    '>': `${amp}gt;`,
    '"': `${amp}quot;`,
    "'": `${amp}#39;`,
  }
  return value.replace(/[&<>"']/g, ch => entities[ch])
}

function locationLine(summary: EstimateSummary): string {
  return summary.address ? `${summary.address}, ${summary.zip}` : summary.zip
}

function textBody(summary: EstimateSummary, siteOrigin: string | undefined, bookingUrl: string | undefined): string {
  const lines = [
    `Hi ${summary.name},`,
    '',
    'Thank you for contacting Summit Ridge Roofing. We received your estimate request:',
    '',
    `Service: ${summary.service}`,
    `Location: ${locationLine(summary)}`,
    `Estimated roof age: ${summary.roofAge ?? "I don't know"}`,
    `Insurance claim: ${summary.insuranceClaim === true ? 'Yes' : 'No'}`,
    '',
    'What happens next: a roofing specialist will contact you to discuss your project.',
  ]
  if (bookingUrl) lines.push('', `Ready to book now? ${bookingUrl}`)
  else if (siteOrigin) lines.push('', `Ready to book now? See current services at ${siteOrigin}`)
  lines.push('', '— Summit Ridge Roofing Co.', 'This message was sent by the Summit Ridge Roofing demo site.')
  return lines.join('\n')
}

function summaryRow(label: string, value: string): string {
  return `<tr>
<td style="padding:10px 16px;font-family:Arial,sans-serif;font-size:11px;letter-spacing:1px;color:#65756d;text-transform:uppercase;vertical-align:top;">${label}</td>
<td style="padding:10px 16px;font-family:Georgia,serif;font-size:15px;color:#203b33;">${value}</td>
</tr>`
}

function htmlBody(summary: EstimateSummary, siteOrigin: string | undefined, bookingUrl: string | undefined, bookingLabel: string | undefined): string {
  const button = bookingUrl && bookingLabel
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0 8px;"><tr><td style="background:#203b33;border-radius:999px;">
<a href="${escapeHtml(bookingUrl)}" style="display:inline-block;padding:12px 24px;font-family:Arial,sans-serif;font-size:14px;color:#f9f8ef;text-decoration:none;">${bookingLabel}</a>
</td></tr></table>`
    : ''
  const footerLink = siteOrigin
    ? `<a href="https://${siteOrigin}" style="color:#203b33;">${siteOrigin}</a> · `
    : ''
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f9f8ef;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9f8ef;padding:24px 12px;"><tr><td align="center">
<table role="presentation" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fffdf6;border:1px solid #cbd5ca;border-radius:12px;overflow:hidden;">
<tr><td style="background:#203b33;padding:26px 32px;font-family:Georgia,serif;font-size:19px;letter-spacing:2px;color:#f9f8ef;">▲ SUMMIT RIDGE <span style="color:#d49b56;">ROOFING CO.</span></td></tr>
<tr><td style="padding:32px;">
<h1 style="margin:0 0 12px;font-family:Georgia,serif;font-size:22px;color:#203b33;">Thanks, ${escapeHtml(summary.name)} — we received your estimate request.</h1>
<p style="margin:0 0 24px;font-family:Arial,sans-serif;font-size:14px;line-height:20px;color:#65756d;">A roofing specialist will contact you to discuss your project. Meanwhile, here is what you asked about:</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #cbd5ca;border-radius:8px;background:#f9f8ef;">
${summaryRow('Service', escapeHtml(summary.service))}
${summaryRow('Location', escapeHtml(locationLine(summary)))}
${summaryRow('Roof age', escapeHtml(summary.roofAge ?? "I don't know"))}
${summaryRow('Insurance claim', summary.insuranceClaim === true ? 'Yes' : 'No')}
</table>
${button}
</td></tr>
<tr><td style="padding:18px 32px;background:#f7f5ea;border-top:1px solid #cbd5ca;">
<p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#65756d;">${footerLink}Summit Ridge Roofing is a demo website; details shown are examples.</p>
</td></tr>
</table>
</td></tr></table>
</body></html>`
}

export async function sendEstimateConfirmation(requestId: string, email: string, summary: EstimateSummary): Promise<boolean> {
  const { RESEND_API_KEY, ESTIMATE_EMAIL_FROM, WHOP_PIXEL_HOSTNAME } = process.env
  if (!RESEND_API_KEY || !ESTIMATE_EMAIL_FROM) return false

  const siteOrigin = WHOP_PIXEL_HOSTNAME
  const booking = siteOrigin ? bookingLinks[summary.service] : undefined
  const bookingUrl = booking && siteOrigin ? `https://${siteOrigin}${booking.path}` : undefined

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `estimate-form/${requestId}`,
      },
      body: JSON.stringify({
        from: ESTIMATE_EMAIL_FROM,
        to: [email],
        subject: 'We received your roofing estimate request',
        text: textBody(summary, siteOrigin, bookingUrl),
        html: htmlBody(summary, siteOrigin, bookingUrl, booking?.label),
      }),
      signal: AbortSignal.timeout(10000),
    })
    if (!response.ok) console.error('Estimate confirmation email failed:', response.status)
    return response.ok
  } catch {
    console.error('Estimate confirmation email failed: network error')
    return false
  }
}
