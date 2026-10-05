import { SITE, getGuideCards } from '../data/pages.js'

function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function renderArticle(page) {
  const sections = (page.sections || [])
    .map((section) => {
      const heading = section.heading ? `<h2>${esc(section.heading)}</h2>` : ''
      const paragraphs = (section.paragraphs || []).map((paragraph) => `<p>${esc(paragraph)}</p>`).join('')
      const list = section.list
        ? `<ul>${section.list.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>`
        : ''
      return `<section class="privacy-section">${heading}${paragraphs}${list}</section>`
    })
    .join('')

  const cards = page.id === 'guides'
    ? `<div class="content-cards">${getGuideCards().map((card) => `<a class="content-card" href="${esc(card.path)}"><strong>${esc(card.nav)}</strong><span>${esc(card.summary)}</span></a>`).join('')}</div>`
    : ''

  const links = (page.links || [])
    .map((link) => `<a href="${esc(link.path)}">${esc(link.label)}</a>`)
    .join('')

  const updated = page.updated ? `<p class="privacy-meta">Updated ${esc(page.updated)}</p>` : ''

  return `<div class="screen privacy-screen"><article class="privacy-container"><p class="privacy-meta">${esc(page.kicker || '')}</p><h1>${esc(page.heading || page.title)}</h1>${updated}${sections}${cards}<nav class="content-related" aria-label="Related pages">${links}</nav></article></div>`
}

function replaceMeta(html, attr, key, content) {
  const pattern = new RegExp(`(<meta ${attr}="${key}" content=")[^"]*(")`)
  return html.replace(pattern, `$1${esc(content)}$2`)
}

export function renderPrerenderedHtml(shell, page) {
  const path = page.path || '/'
  const url = `${SITE.origin}${path === '/' ? '/' : path}`
  let html = shell
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(page.title)}</title>`)
  html = replaceMeta(html, 'name', 'description', page.description)
  html = replaceMeta(html, 'property', 'og:title', page.title)
  html = replaceMeta(html, 'property', 'og:description', page.description)
  html = replaceMeta(html, 'property', 'og:url', url)
  html = replaceMeta(html, 'name', 'twitter:title', page.title)
  html = replaceMeta(html, 'name', 'twitter:description', page.description)
  html = html.replace(
    /<link rel="canonical" href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${esc(url)}" />`
  )
  html = html.replace('<div id="root"></div>', `<div id="root">${renderArticle(page)}</div>`)
  return html
}
