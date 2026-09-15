import {
  configureWebPush,
  pushConfigured,
  sanitizeSubscribeInput,
  vapidPublicKey,
} from '../server/pushSend.js'
import { removeSubscription, saveSubscription, hasDurableStore } from '../server/pushStore.js'

function json(res, status, payload) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

function readBody(req) {
  if (req.body && typeof req.body === 'object') return Promise.resolve(req.body)
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => {
      data += chunk
      if (data.length > 50_000) reject(new Error('body_too_large'))
    })
    req.on('end', () => {
      if (!data) return resolve({})
      try {
        resolve(JSON.parse(data))
      } catch (error) {
        reject(error)
      }
    })
    req.on('error', reject)
  })
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')

  if (req.method === 'GET') {
    return json(res, 200, {
      vapidPublicKey: vapidPublicKey() || null,
      pushConfigured: pushConfigured(),
      durableStore: hasDurableStore(),
    })
  }

  if (req.method !== 'POST') {
    return json(res, 405, { error: 'Method not allowed' })
  }

  let body
  try {
    body = await readBody(req)
  } catch {
    return json(res, 400, { error: 'Invalid JSON' })
  }

  const action = body.action === 'unsubscribe' ? 'unsubscribe' : 'subscribe'

  if (action === 'unsubscribe') {
    const endpoint = typeof body.endpoint === 'string' ? body.endpoint.trim() : ''
    if (!endpoint.startsWith('https://')) return json(res, 400, { error: 'Invalid endpoint' })
    await removeSubscription(endpoint)
    return json(res, 200, { ok: true })
  }

  if (!pushConfigured()) {
    return json(res, 503, { error: 'push_not_configured' })
  }
  configureWebPush()

  const sanitized = sanitizeSubscribeInput(body)
  if (sanitized.error) return json(res, 400, { error: sanitized.error })

  await saveSubscription(sanitized.record)
  return json(res, 200, {
    ok: true,
    stored: ['endpoint', 'keys', 'hour', 'tz'],
    notStored: ['name', 'email', 'phone', 'profile'],
    durableStore: hasDurableStore(),
  })
}
