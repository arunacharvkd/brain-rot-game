import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const INDEX_KEY = 'brc:push:index'
const FILE_PATH = path.join('/tmp', 'brc-push-subs.json')

function kvConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  return { url: url.replace(/\/$/, ''), token }
}

export function endpointId(endpoint) {
  return createHash('sha256').update(endpoint).digest('hex').slice(0, 32)
}

export function subKey(id) {
  return `brc:push:sub:${id}`
}

async function kv(command) {
  const cfg = kvConfig()
  if (!cfg) return null
  const res = await fetch(`${cfg.url}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  })
  if (!res.ok) {
    throw new Error(`kv_${res.status}`)
  }
  return res.json()
}

async function readFileStore() {
  try {
    return JSON.parse(await readFile(FILE_PATH, 'utf8'))
  } catch {
    return { index: [], subs: {} }
  }
}

async function writeFileStore(store) {
  await mkdir(path.dirname(FILE_PATH), { recursive: true })
  await writeFile(FILE_PATH, JSON.stringify(store))
}

export function hasDurableStore() {
  return Boolean(kvConfig())
}

export async function upsertSubscription(record) {
  const id = endpointId(record.endpoint)
  const payload = { ...record, id }
  const cfg = kvConfig()
  if (cfg) {
    await kv(['SET', subKey(id), JSON.stringify(payload)])
    await kv(['SADD', INDEX_KEY, id])
    return payload
  }
  const store = await readFileStore()
  store.subs[id] = payload
  if (!store.index.includes(id)) store.index.push(id)
  await writeFileStore(store)
  return payload
}

export async function removeSubscription(endpoint) {
  const id = endpointId(endpoint)
  const cfg = kvConfig()
  if (cfg) {
    await kv(['DEL', subKey(id)])
    await kv(['SREM', INDEX_KEY, id])
    return
  }
  const store = await readFileStore()
  delete store.subs[id]
  store.index = store.index.filter((item) => item !== id)
  await writeFileStore(store)
}

export async function listSubscriptions() {
  const cfg = kvConfig()
  if (cfg) {
    const indexRes = await kv(['SMEMBERS', INDEX_KEY])
    const ids = indexRes?.result || []
    const out = []
    for (const id of ids) {
      const row = await kv(['GET', subKey(id)])
      if (!row?.result) continue
      try {
        out.push(typeof row.result === 'string' ? JSON.parse(row.result) : row.result)
      } catch {
        /* skip corrupt */
      }
    }
    return out
  }
  const store = await readFileStore()
  return Object.values(store.subs)
}

export async function saveSubscription(record) {
  return upsertSubscription(record)
}
