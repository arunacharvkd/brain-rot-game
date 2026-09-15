import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'

const PORT = 4177
const BASE = `http://127.0.0.1:${PORT}`
const mediaDir = process.env.REMINDER_MEDIA_DIR || '/opt/cursor/artifacts'
const storeMedia = '/cursor/stores/bc-096ef2c4-35ed-47e8-8ebd-f1f0f102188c/media'

async function waitForServer() {
  const deadline = Date.now() + 60000
  while (Date.now() < deadline) {
    try {
      const res = await fetch(BASE)
      if (res.ok) return
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 400))
  }
  throw new Error('preview did not start')
}

async function shot(page, name) {
  await fs.mkdir(mediaDir, { recursive: true })
  await fs.mkdir(storeMedia, { recursive: true })
  const file = `${name}.png`
  const dest = path.join(mediaDir, file)
  await page.screenshot({ path: dest, fullPage: true })
  await fs.copyFile(dest, path.join(storeMedia, file))
  return dest
}

const preview = spawn('npx', ['vite', 'preview', '--host', '127.0.0.1', '--port', String(PORT)], {
  stdio: 'ignore',
  cwd: process.cwd(),
})

try {
  await waitForServer()
  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    permissions: ['notifications'],
  })
  const page = await context.newPage()
  await page.goto(BASE, { waitUntil: 'networkidle' })

  const turnOn = page.getByRole('button', { name: 'Turn on reminder' })
  if (!(await turnOn.isVisible())) throw new Error('opt-in Turn on reminder missing')
  const notNow = page.getByRole('button', { name: 'Not now' })
  if (!(await notNow.isVisible())) throw new Error('Not now missing')
  await shot(page, 'reminder_optin_phone')

  await page.selectOption('.daily-reminder-hour select', '7')
  await turnOn.click()
  await page.getByRole('button', { name: 'Turn off reminder' }).waitFor({ timeout: 8000 })
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('brc-daily-reminder') || '{}'))
  if (!stored.enabled || stored.hour !== 7) throw new Error(`prefs not saved: ${JSON.stringify(stored)}`)
  if (stored.email || stored.name || stored.phone) throw new Error('profile leaked into reminder prefs')
  await shot(page, 'reminder_enabled_phone')

  await page.getByRole('button', { name: 'Turn off reminder' }).click()
  await turnOn.waitFor()

  await page.evaluate(() => {
    localStorage.setItem(
      'brc-daily-reminder',
      JSON.stringify({ enabled: true, hour: 0, channel: 'in-app', lastNudgeOn: '' }),
    )
  })
  await page.reload({ waitUntil: 'networkidle' })
  await page.getByText('Your 60s drill is up').first().waitFor()
  await shot(page, 'reminder_nudge_phone')

  await page.goto(`${BASE}/privacy`, { waitUntil: 'networkidle' })
  const privacy = await page.locator('.privacy-container').innerText()
  for (const needle of ['notification permission', 'anonymous Web Push', 'name, email, phone', 'identify a person']) {
    if (!privacy.includes(needle)) throw new Error(`privacy missing: ${needle}`)
  }
  await page.getByRole('heading', { name: 'Daily drill reminders' }).scrollIntoViewIfNeeded()
  const reminderPolicy = page.locator('section.privacy-section').filter({ hasText: 'Daily drill reminders' })
  await fs.mkdir(mediaDir, { recursive: true })
  await fs.mkdir(storeMedia, { recursive: true })
  const privacyFile = 'reminder_privacy_phone.png'
  await reminderPolicy.screenshot({ path: path.join(mediaDir, privacyFile) })
  await fs.copyFile(path.join(mediaDir, privacyFile), path.join(storeMedia, privacyFile))

  await page.goto(`${BASE}/reaction`, { waitUntil: 'networkidle' })
  const start = page.getByRole('button', { name: /Start Reaction Test/i })
  await start.waitFor()
  const startBox = await start.boundingBox()
  const footerBox = await page.locator('.global-footer').boundingBox()
  if (!startBox || !footerBox) throw new Error('reaction layout missing')
  if (startBox.y + startBox.height > footerBox.y + 8) {
    throw new Error('Start is covered by footer')
  }
  await shot(page, 'reminder_reaction_phone')

  const ads = await page.goto(BASE, { waitUntil: 'networkidle' })
  void ads
  const ad = page.locator('.ad-break, ins.adsbygoogle')
  if ((await ad.count()) === 0) throw new Error('landing ad slot missing')

  await browser.close()
  console.log('reminder-e2e ok')
  preview.kill('SIGKILL')
  process.exit(0)
} catch (error) {
  console.error(error)
  preview.kill('SIGKILL')
  process.exit(1)
}
