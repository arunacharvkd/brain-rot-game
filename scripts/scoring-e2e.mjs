import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'

const PORT = 4178
const BASE = `http://127.0.0.1:${PORT}`
const mediaDir = process.env.SCORING_MEDIA_DIR || '/opt/cursor/artifacts'
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

function anagram(a, b) {
  return [...a].sort().join('') === [...b].sort().join('')
}

async function playWordRound(page, delayMs = 0) {
  if (delayMs) await page.waitForTimeout(delayMs)
  const scrambled = (await page.locator('.scramble-word').innerText()).trim()
  const buttons = page.locator('.word-options button')
  const count = await buttons.count()
  for (let i = 0; i < count; i += 1) {
    const label = (await buttons.nth(i).innerText()).trim()
    if (anagram(label, scrambled)) {
      await buttons.nth(i).click()
      return
    }
  }
  throw new Error(`no anagram for ${scrambled}`)
}

async function playWordRun(page, delayMs) {
  await page.getByRole('button', { name: /Start/i }).click()
  for (let i = 0; i < 10; i += 1) {
    await page.locator('.scramble-word').waitFor()
    await playWordRound(page, delayMs)
    if (i < 9) {
      await page.waitForTimeout(650)
    }
  }
  await page.locator('.game-done-score').waitFor({ timeout: 8000 })
  const scoreText = await page.locator('.game-done-score').innerText()
  const timeText = await page.locator('.game-done-time').innerText()
  const breakdown = await page.locator('.game-done-breakdown').innerText()
  if (!/\d+\s*pts/i.test(scoreText)) throw new Error(`missing pts: ${scoreText}`)
  if (!/Time/i.test(timeText)) throw new Error(`missing time: ${timeText}`)
  if (!/play/.test(breakdown) || !/speed/.test(breakdown)) throw new Error(`missing breakdown: ${breakdown}`)
  const save = await page.evaluate(() => JSON.parse(localStorage.getItem('brain-rot-save') || '{}'))
  const score = save?.state?.arcadeScores?.word
  const ms = save?.state?.arcadeTimes?.word
  return { score, ms, scoreText, timeText, breakdown }
}

async function tapBrainRounds(page, rounds = 5) {
  for (let i = 0; i < rounds; i += 1) {
    await page.locator('.brain-target').waitFor({ timeout: 12000 })
    await page.locator('.brain-target').click({ force: true })
    await page.waitForTimeout(400)
  }
}

const preview = spawn('npx', ['vite', 'preview', '--host', '127.0.0.1', '--port', String(PORT)], {
  stdio: 'ignore',
  cwd: process.cwd(),
})

try {
  await waitForServer()
  const browser = await chromium.launch()
  const phone = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  })
  const page = await phone.newPage()
  await page.goto(BASE, { waitUntil: 'networkidle' })

  await page.locator('select').first().selectOption('hi')

  await page.getByRole('button', { name: /Start Test|टेस्ट शुरू करें/i }).first().click()
  await page.locator('.quiz-option').first().waitFor()
  for (let i = 0; i < 7; i += 1) {
    await page.locator('.quiz-option').first().click()
    await page.waitForTimeout(420)
  }

  await page.getByRole('button', { name: /Start Reaction Test|रिएक्शन|प्रतिक्रिया/i }).click()
  await tapBrainRounds(page, 5)
  await page.locator('.diag-score-row').waitFor({ timeout: 12000 })
  const diag = await page.locator('.diag-score-row').innerText()
  if (!/\d+s|\d+:\d+/.test(diag)) throw new Error(`diagnosis missing time: ${diag}`)
  if (!/avg \d+ms/.test(diag) && !/ms/.test(diag)) throw new Error(`diagnosis missing reaction ms: ${diag}`)
  const saveAfterQuiz = await page.evaluate(() => JSON.parse(localStorage.getItem('brain-rot-save') || '{}'))
  const qScore = saveAfterQuiz?.state?.quizScore
  if (typeof qScore !== 'number' || Number.isNaN(qScore)) throw new Error(`quiz score not numeric: ${qScore}`)
  await shot(page, 'scoring_diagnosis_phone')

  await page.getByRole('button', { name: /Start Brain Rehab|रिहैब/i }).click()
  await page.getByText(/Word Scramble|वर्ड/).first().waitFor()

  const wordCard = page.locator('.arcade-card').filter({ hasText: /Word Scramble|वर्ड/ })
  await wordCard.getByRole('button').click()

  const fast = await playWordRun(page, 0)
  await shot(page, 'scoring_word_fast_phone')
  await page.getByRole('button', { name: /Play Again|फिर खेलें/i }).click()
  const slow = await playWordRun(page, 3200)
  await shot(page, 'scoring_word_slow_phone')
  if (!(slow.ms > fast.ms)) throw new Error(`slow run was not slower: ${JSON.stringify({ fast, slow })}`)
  if (!(fast.score >= slow.score)) throw new Error(`fast should score >= slow: ${JSON.stringify({ fast, slow })}`)

  await page.getByRole('button', { name: /Continue to Arcade|आर्केड/i }).click()

  const colourCard = page.locator('.arcade-card').filter({ hasText: /Colour vs Word|Colour/ })
  await colourCard.getByRole('button').click()
  await page.getByRole('button', { name: /Start/i }).click()
  for (let i = 0; i < 15; i += 1) {
    const color = await page.locator('.stroop-word').evaluate((el) => getComputedStyle(el).color)
    const chips = page.locator('.colour-chip')
    const n = await chips.count()
    let clicked = false
    for (let c = 0; c < n; c += 1) {
      const bg = await chips.nth(c).evaluate((el) => getComputedStyle(el).backgroundColor)
      if (bg === color) {
        await chips.nth(c).click()
        clicked = true
        break
      }
    }
    if (!clicked) await chips.first().click()
    await page.waitForTimeout(700)
  }
  await page.locator('.game-done-time').waitFor()
  await shot(page, 'scoring_colour_done_phone')
  await page.getByRole('button', { name: /Continue to Arcade|आर्केड/i }).click()

  const oddCard = page.locator('.arcade-card').filter({ hasText: /Odd One Out/ })
  await oddCard.getByRole('button').click()
  await page.getByRole('button', { name: /Start/i }).click()
  for (let q = 0; q < 12; q += 1) {
    const gridBtns = page.locator('[style*="grid-template-columns"] button')
    const count = await gridBtns.count()
    const emojis = []
    for (let i = 0; i < count; i += 1) {
      emojis.push(await gridBtns.nth(i).innerText())
    }
    const freq = {}
    emojis.forEach((e) => { freq[e] = (freq[e] || 0) + 1 })
    const odd = Object.keys(freq).find((k) => freq[k] === 1)
    const idx = emojis.findIndex((e) => e === odd)
    await gridBtns.nth(idx).click()
    await page.waitForTimeout(500)
  }
  await page.locator('.game-done-time').waitFor()
  await page.getByRole('button', { name: /Continue to Arcade|आर्केड/i }).click()

  await page.getByRole('button', { name: /See Results/i }).click()
  await page.locator('.results-run-list').waitFor()
  const results = await page.locator('.results-screen').innerText()
  if (!/Time/i.test(results) && !/Rehab time/i.test(results)) throw new Error('results missing time')
  if (!/pts/i.test(results)) throw new Error('results missing pts')
  await shot(page, 'scoring_results_phone')

  const desktop = await browser.newContext({ viewport: { width: 1280, height: 800 } })
  const desk = await desktop.newPage()
  await desk.addInitScript((state) => {
    localStorage.setItem('brain-rot-save', JSON.stringify(state))
  }, await page.evaluate(() => JSON.parse(localStorage.getItem('brain-rot-save') || '{}')))
  await desk.goto(`${BASE}/results`, { waitUntil: 'networkidle' })
  await desk.locator('.results-run-list').waitFor({ timeout: 8000 }).catch(() => {})
  await shot(desk, 'scoring_results_desktop')

  const startBox = await (async () => {
    await page.goto(`${BASE}/reaction`, { waitUntil: 'networkidle' })
    const start = page.getByRole('button', { name: /Start Reaction Test/i })
    await start.waitFor()
    return start.boundingBox()
  })()
  const footerBox = await page.locator('.global-footer').boundingBox()
  if (startBox && footerBox && startBox.y + startBox.height > footerBox.y + 8) {
    throw new Error('Start is covered by footer')
  }
  await shot(page, 'scoring_reaction_phone')

  await browser.close()
  console.log('scoring-e2e ok', { fast, slow })
  preview.kill('SIGKILL')
  process.exit(0)
} catch (error) {
  console.error(error)
  preview.kill('SIGKILL')
  process.exit(1)
}
