import { test } from 'node:test'
import assert from 'node:assert/strict'
import { sendEstimateConfirmation } from '../src/server/estimate-email.ts'

const emailEnvKeys = ['RESEND_API_KEY', 'ESTIMATE_EMAIL_FROM', 'WHOP_PIXEL_HOSTNAME']

// Sets the given env values and returns a restore function. Undefined deletes.
function setEmailEnv(values) {
  const saved = Object.fromEntries(emailEnvKeys.map(key => [key, process.env[key]]))
  for (const key of emailEnvKeys) {
    if (values[key] === undefined) delete process.env[key]; else process.env[key] = values[key]
  }
  return () => {
    for (const key of emailEnvKeys) {
      if (saved[key] === undefined) delete process.env[key]; else process.env[key] = saved[key]
    }
  }
}

test('reports missing configuration instead of sending', async () => {
  const restore = setEmailEnv({})
  try {
    assert.equal(
      await sendEstimateConfirmation('lead_123', 'customer@example.com', { name: 'Sam', service: 'Certified Drone & Hail Inspections', zip: '75201' }),
      false,
    )
  } finally { restore() }
})

test('sends a branded HTML summary with a direct booking link for the chosen service', async () => {
  const restore = setEmailEnv({
    RESEND_API_KEY: 'test-key',
    ESTIMATE_EMAIL_FROM: 'Roofing <roof@example.com>',
    WHOP_PIXEL_HOSTNAME: 'roof.example',
  })
  const original = globalThis.fetch
  try {
    globalThis.fetch = async (url, options) => {
      assert.equal(url, 'https://api.resend.com/emails')
      assert.equal(options.headers['Idempotency-Key'], 'estimate-form/lead_123')
      const body = JSON.parse(options.body)
      assert.equal(body.from, 'Roofing <roof@example.com>')
      assert.deepEqual(body.to, ['customer@example.com'])
      assert.match(body.text, /Certified Drone & Hail Inspections/)
      assert.match(body.text, /https:\/\/roof\.example\/checkout\?service=inspection/)
      assert.match(body.html, /Summit Ridge/)
      assert.match(body.html, /Thanks, Sam/)
      const amp = String.fromCharCode(38)
      assert.ok(body.html.includes(`Certified Drone ${amp}amp; Hail Inspections`), 'service name is escaped in HTML')
      assert.match(body.html, /75201/)
      assert.match(body.html, /https:\/\/roof\.example\/checkout\?service=inspection/)
      return new Response('{}', { status: 200 })
    }
    assert.equal(
      await sendEstimateConfirmation('lead_123', 'customer@example.com', { name: 'Sam', service: 'Certified Drone & Hail Inspections', zip: '75201' }),
      true,
    )
  } finally {
    globalThis.fetch = original
    restore()
  }
})

test('links replacement requests to the project deposit checkout', async () => {
  const restore = setEmailEnv({
    RESEND_API_KEY: 'test-key',
    ESTIMATE_EMAIL_FROM: 'Roofing <roof@example.com>',
    WHOP_PIXEL_HOSTNAME: 'roof.example',
  })
  const original = globalThis.fetch
  try {
    globalThis.fetch = async (url, options) => {
      const body = JSON.parse(options.body)
      assert.match(body.html, /https:\/\/roof\.example\/checkout\?service=deposit/)
      assert.doesNotMatch(body.html, /service=replacement/)
      return new Response('{}', { status: 200 })
    }
    assert.equal(
      await sendEstimateConfirmation('lead_456', 'customer@example.com', {
        name: 'Alex', service: 'Complete Roof Replacement', zip: '75201', roofAge: '6-10 years', insuranceClaim: true,
      }),
      true,
    )
  } finally {
    globalThis.fetch = original
    restore()
  }
})

test('links repair requests to the flat-rate tune-up checkout', async () => {
  const restore = setEmailEnv({
    RESEND_API_KEY: 'test-key',
    ESTIMATE_EMAIL_FROM: 'Roofing <roof@example.com>',
    WHOP_PIXEL_HOSTNAME: 'roof.example',
  })
  const original = globalThis.fetch
  try {
    globalThis.fetch = async (url, options) => {
      const body = JSON.parse(options.body)
      assert.match(body.html, /https:\/\/roof\.example\/checkout\?service=repair/)
      return new Response('{}', { status: 200 })
    }
    assert.equal(
      await sendEstimateConfirmation('lead_789', 'customer@example.com', { name: 'Jo', service: 'Emergency Roof & Leak Repair', zip: '75201' }),
      true,
    )
  } finally {
    globalThis.fetch = original
    restore()
  }
})

test('does not advertise a direct checkout for gutter requests', async () => {
  const restore = setEmailEnv({
    RESEND_API_KEY: 'test-key',
    ESTIMATE_EMAIL_FROM: 'Roofing <roof@example.com>',
    WHOP_PIXEL_HOSTNAME: 'roof.example',
  })
  const original = globalThis.fetch
  try {
    globalThis.fetch = async (url, options) => {
      const body = JSON.parse(options.body)
      assert.doesNotMatch(body.html, /checkout\?service=/)
      return new Response('{}', { status: 200 })
    }
    assert.equal(
      await sendEstimateConfirmation('lead_abc', 'customer@example.com', { name: 'Kim', service: 'Seamless Gutters & Architectural Flashing', zip: '75201' }),
      true,
    )
  } finally {
    globalThis.fetch = original
    restore()
  }
})

test('still reports failure when Resend rejects the send', async () => {
  const restore = setEmailEnv({
    RESEND_API_KEY: 'test-key',
    ESTIMATE_EMAIL_FROM: 'Roofing <roof@example.com>',
    WHOP_PIXEL_HOSTNAME: 'roof.example',
  })
  const original = globalThis.fetch
  try {
    globalThis.fetch = async () => new Response('{}', { status: 500 })
    assert.equal(
      await sendEstimateConfirmation('lead_123', 'customer@example.com', { name: 'Sam', service: 'Certified Drone & Hail Inspections', zip: '75201' }),
      false,
    )
  } finally {
    globalThis.fetch = original
    restore()
  }
})
