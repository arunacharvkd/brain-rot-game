const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000
const RATE_LIMIT_MAX_REQUESTS = 5
const MIN_SUBMIT_AGE_MS = 2500
const MAX_SUBMIT_AGE_MS = 2 * 60 * 60 * 1000
const MAX_NAME_LEN = 80
const MAX_EMAIL_LEN = 254
const MAX_MESSAGE_LEN = 2000
const rateLimitStore = globalThis.__feedbackRateLimitStore || new Map()
globalThis.__feedbackRateLimitStore = rateLimitStore

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const ip = getClientIp(req)
  const now = Date.now()
  const bucket = rateLimitStore.get(ip)

  if (!bucket || now - bucket.windowStart >= RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(ip, { count: 1, windowStart: now })
  } else if (bucket.count >= RATE_LIMIT_MAX_REQUESTS) {
    const retryAfterSec = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - bucket.windowStart)) / 1000)
    res.setHeader('Retry-After', String(retryAfterSec))
    return res.status(429).json({
      error: 'Rate limit exceeded',
      detail: `Try again in ${retryAfterSec} seconds.`,
    })
  } else {
    bucket.count += 1
    rateLimitStore.set(ip, bucket)
  }

  for (const [key, value] of rateLimitStore.entries()) {
    if (now - value.windowStart >= RATE_LIMIT_WINDOW_MS) {
      rateLimitStore.delete(key)
    }
  }

  try {
    const body = req.body || {}
    const name = sanitizeString(body.name)
    const email = sanitizeString(body.email)
    const message = sanitizeString(body.message)
    const website = sanitizeString(body.website)
    const formStartedAt = Number(body.formStartedAt)

    if (website) {
      return res.status(200).json({ ok: true })
    }

    if (Number.isNaN(formStartedAt)) {
      return res.status(400).json({ error: 'Invalid submission metadata' })
    }

    const submitAge = Date.now() - formStartedAt
    if (submitAge < MIN_SUBMIT_AGE_MS || submitAge > MAX_SUBMIT_AGE_MS) {
      return res.status(400).json({ error: 'Submission rejected' })
    }

    if (!name || !message) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    if (name.length > MAX_NAME_LEN || email.length > MAX_EMAIL_LEN || message.length > MAX_MESSAGE_LEN) {
      return res.status(400).json({ error: 'Input exceeds allowed length' })
    }

    if (email && !isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    const apiKey =
      process.env.RESEND_API_KEY ||
      process.env.RESEND_KEY ||
      process.env.RESEND_TOKEN
    const to =
      process.env.FEEDBACK_TO_EMAIL ||
      process.env.CONTACT_EMAIL ||
      'vkdarunacharya@gmail.com'
    const from =
      process.env.RESEND_FROM_EMAIL ||
      process.env.RESEND_FROM ||
      process.env.FEEDBACK_FROM_EMAIL ||
      'onboarding@resend.dev'

    if (!apiKey) {
      return res.status(500).json({
        error: 'Server email is not configured. Add RESEND_API_KEY in env and restart.',
      })
    }

    const text = [
      'New BrainRotChecker feedback',
      '',
      `Name: ${name}`,
      `Email: ${email || 'Not provided'}`,
      '',
      'Message:',
      message,
    ].join('\n')

    const html = `
      <h2>New BrainRotChecker feedback</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email || 'Not provided')}</p>
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(message).replace(/\n/g, '<br/>')}</p>
    `

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to,
        subject: `BrainRotChecker feedback from ${name}`,
        text,
        html,
        reply_to: email || undefined,
      }),
    })

    if (!resendRes.ok) {
      const resendStatus = resendRes.status
      const resendBody = await resendRes.text()

      if (process.env.NODE_ENV !== 'production') {
        console.error('[feedback][resend]', resendStatus, resendBody)
      }

      let providerError = 'Email provider unavailable'
      if (resendStatus === 401) {
        providerError = 'Resend auth failed. Check RESEND_API_KEY.'
      } else if (resendStatus === 403) {
        providerError = 'Resend sender is not verified. Verify RESEND_FROM_EMAIL/domain.'
      } else if (resendStatus === 422) {
        providerError = 'Resend rejected sender/recipient config. Check FROM and TO emails.'
      } else if (resendStatus >= 500) {
        providerError = 'Resend service is temporarily unavailable.'
      }

      return res.status(502).json({ error: providerError })
    }

    return res.status(200).json({ ok: true })
  } catch {
    return res.status(500).json({ error: 'Unexpected server error' })
  }
}

function getClientIp(req) {
  const vercel = req.headers['x-vercel-forwarded-for']
  if (typeof vercel === 'string' && vercel.length > 0) {
    return vercel.split(',')[0].trim()
  }
  const realIp = req.headers['x-real-ip']
  if (typeof realIp === 'string' && realIp.length > 0) {
    return realIp.trim()
  }
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim()
  }
  return req.socket?.remoteAddress || 'unknown'
}

function sanitizeString(value) {
  return String(value ?? '').trim()
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
