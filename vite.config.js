import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import feedbackHandler from './api/feedback.js'

function feedbackApiDevPlugin() {
  return {
    name: 'feedback-api-dev',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/feedback', async (req, res, next) => {
        if (req.method !== 'POST') return next()

        try {
          req.body = await readJsonBody(req)
          const wrappedRes = makeVercelLikeResponse(res)
          await feedbackHandler(req, wrappedRes)
        } catch {
          res.statusCode = 400
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Invalid JSON body' }))
        }
      })
    },
  }
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => {
      data += chunk
      if (data.length > 100_000) {
        reject(new Error('body_too_large'))
      }
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

function makeVercelLikeResponse(res) {
  return {
    setHeader: (key, value) => res.setHeader(key, value),
    status: (code) => ({
      json: (payload) => {
        res.statusCode = code
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(payload))
      },
    }),
  }
}

export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))

  return {
    plugins: [react(), feedbackApiDevPlugin()],
  }
})
