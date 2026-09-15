import { sendDailyTick } from '../server/pushSend.js'

function json(res, status, payload) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

function authorized(req) {
  if (String(req.headers['x-vercel-cron'] || '') === '1') return true
  const secret = String(process.env.CRON_SECRET || '').trim()
  if (!secret) {
    return process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1'
  }
  const header = String(req.headers.authorization || '')
  let querySecret = ''
  try {
    querySecret = String(req.query?.secret || new URL(req.url, 'http://localhost').searchParams.get('secret') || '')
  } catch {
    querySecret = ''
  }
  return header === `Bearer ${secret}` || querySecret === secret
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return json(res, 405, { error: 'Method not allowed' })
  }
  if (!authorized(req)) {
    return json(res, 401, { error: 'Unauthorized' })
  }
  const result = await sendDailyTick()
  return json(res, result.ok ? 200 : 503, result)
}
