import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createEstimateLead } from '../src/server/estimate-lead.ts'

// Replaces global fetch with a stub and records every outgoing request.
function stubFetch(handler) {
  const original = globalThis.fetch
  const calls = []
  globalThis.fetch = async (url, init = {}) => {
    calls.push({ url: String(url), init })
    return handler(String(url), init, calls.length)
  }
  return {
    calls,
    restore() { globalThis.fetch = original },
  }
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

test('creates the Whop lead without sending an Idempotency-Key header', async () => {
  const stub = stubFetch(() => jsonResponse({ id: 'lead_abc123' }))
  try {
    const leadId = await createEstimateLead('biz_test', 'user_test', { name: 'Sam' })
    assert.equal(leadId, 'lead_abc123')

    const headers = stub.calls[0].init.headers
    const key = Object.keys(headers).find(name => name.toLowerCase() === 'idempotency-key')
    assert.equal(key, undefined, 'POST /leads must not send an Idempotency-Key header')
  } finally {
    stub.restore()
  }
})

test('sends one separate request per estimate submission', async () => {
  const stub = stubFetch((_url, _init, callNumber) => jsonResponse({ id: `lead_call${callNumber}` }))
  try {
    const first = await createEstimateLead('biz_test', 'user_test', { name: 'First', details: 'a' })
    const second = await createEstimateLead('biz_test', 'user_test', { name: 'Second', details: 'b' })

    assert.equal(stub.calls.length, 2, 'each submission must send its own request')
    assert.equal(first, 'lead_call1')
    assert.equal(second, 'lead_call2')

    const firstBody = JSON.parse(stub.calls[0].init.body)
    const secondBody = JSON.parse(stub.calls[1].init.body)
    assert.equal(firstBody.metadata.name, 'First')
    assert.equal(secondBody.metadata.name, 'Second')
    assert.equal(firstBody.account_id, 'biz_test')
    assert.equal(firstBody.user_id, 'user_test')
  } finally {
    stub.restore()
  }
})

test('returns null when Whop rejects the lead', async () => {
  const stub = stubFetch(() => jsonResponse({ error: { message: 'nope' } }, 400))
  try {
    assert.equal(await createEstimateLead('biz_test', 'user_test', { name: 'Sam' }), null)
  } finally {
    stub.restore()
  }
})

test('returns null when Whop answers without a usable lead id', async () => {
  const stub = stubFetch(() => jsonResponse({ id: 'not-a-lead-id' }))
  try {
    assert.equal(await createEstimateLead('biz_test', 'user_test', { name: 'Sam' }), null)
  } finally {
    stub.restore()
  }
})
