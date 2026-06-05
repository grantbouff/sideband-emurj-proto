import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

// Handles POST /dev/save-config → rewrites the concept-1 config constants
function devConfigPlugin() {
  return {
    name: 'dev-config',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.method !== 'POST' || req.url !== '/dev/save-config') return next()

        let body = ''
        req.on('data', chunk => (body += chunk))
        req.on('end', () => {
          try {
            const c = JSON.parse(body)
            const file = resolve(`./src/concepts/${c.user}/concept-${c.conceptId}.jsx`)
            let src = readFileSync(file, 'utf-8')

            src = src
              // FAB-prefixed concepts (1–4)
              .replace(/const FAB_THEME\s*=\s*'[^']*'/, `const FAB_THEME          = '${c.fabTheme}'`)
              .replace(/const FAB_SHADOW_OPACITY\s*=\s*\d+/, `const FAB_SHADOW_OPACITY = ${c.shadowOpacity}`)
              .replace(/const FAB_SCROLL_TRIGGER\s*=\s*\d+/, `const FAB_SCROLL_TRIGGER = ${c.scrollTrigger}`)
              .replace(/const FAB_START_DELAY\s*=\s*\d+/,    `const FAB_START_DELAY    = ${c.startDelay}`)
              .replace(/const FAB_CONDENSE_DELAY\s*=\s*\d+/, `const FAB_CONDENSE_DELAY = ${c.condenseDelay}`)
              .replace(/const FAB_MORPH_DURATION\s*=\s*\d+/, `const FAB_MORPH_DURATION = ${c.morphDuration}`)
              .replace(/const FAB_ENTER_DURATION\s*=\s*\d+/, `const FAB_ENTER_DURATION = ${c.enterDuration}`)
              .replace(/const FAB_EXIT_DURATION\s*=\s*\d+/,  `const FAB_EXIT_DURATION  = ${c.exitDuration}`)
              .replace(/const FAB_DISMISS_TIMER\s*=\s*(null|\d+)/, `const FAB_DISMISS_TIMER  = ${c.dismissTimer ?? 'null'}`)
              .replace(/const FAB_SHOW_CLOSE_BTN\s*=\s*(true|false)/, `const FAB_SHOW_CLOSE_BTN = ${c.showCloseButton ?? true}`)
              // BANNER-prefixed concepts (5+)
              .replace(/const BANNER_THEME\s*=\s*'[^']*'/,          `const BANNER_THEME          = '${c.fabTheme}'`)
              .replace(/const BANNER_SHADOW_OPACITY\s*=\s*\d+/,     `const BANNER_SHADOW_OPACITY = ${c.shadowOpacity}`)
              .replace(/const BANNER_SCROLL_TRIGGER\s*=\s*\d+/,     `const BANNER_SCROLL_TRIGGER = ${c.scrollTrigger}`)
              .replace(/const BANNER_START_DELAY\s*=\s*\d+/,        `const BANNER_START_DELAY    = ${c.startDelay}`)
              .replace(/const BANNER_ENTER_DURATION\s*=\s*\d+/,     `const BANNER_ENTER_DURATION = ${c.enterDuration}`)
              .replace(/const BANNER_EXIT_DURATION\s*=\s*\d+/,      `const BANNER_EXIT_DURATION  = ${c.exitDuration}`)
              .replace(/const BANNER_DISMISS_TIMER\s*=\s*(null|\d+)/, `const BANNER_DISMISS_TIMER  = ${c.dismissTimer ?? 'null'}`)
              // Shared
              .replace(/const MODAL_THEME\s*=\s*'[^']*'/, `const MODAL_THEME        = '${c.modalTheme}'`)
              // Concept 6: D object properties
              .replace(/theme:\s+'[^']*',/,                  `theme:          '${c.theme}',`)
              .replace(/question:\s+'[^']*',/,               `question:       '${c.question}',`)
              .replace(/startDelay:\s+\d+,/,                 `startDelay:     ${c.startDelay},`)
              .replace(/condenseDelay:\s+\d+,/,              `condenseDelay:  ${c.condenseDelay},`)
              .replace(/condenseSpeed:\s+\d+,/,              `condenseSpeed:  ${c.condenseSpeed},`)
              .replace(/enterDuration:\s+\d+,/,              `enterDuration:  ${c.enterDuration},`)
              .replace(/exitDuration:\s+\d+,/,               `exitDuration:   ${c.exitDuration},`)
              .replace(/pulseCount:\s+\d+,/,                 `pulseCount:     ${c.pulseCount},`)
              .replace(/pulseColor:\s+'[^']*',/,             `pulseColor:     '${c.pulseColor}',`)
              .replace(/pulseOpacity:\s+\d+,/,               `pulseOpacity:   ${c.pulseOpacity},`)
              .replace(/disappearTimer:\s+\d+,/,             `disappearTimer: ${c.disappearTimer ?? 0},`)
              .replace(/shadowOpacity:\s+\d+,/,              `shadowOpacity:  ${c.shadowOpacity},`)
              .replace(/modalTheme:\s+'[^']*',/,             `modalTheme:     '${c.modalTheme}',`)
              .replace(/posX:\s+(?:null|\d+),(?:\s*\/\/[^\n]*)?/, `posX:           ${c.posX ?? null},`)
              .replace(/posY:\s+(?:null|\d+),(?:\s*\/\/[^\n]*)?/, `posY:           ${c.posY ?? null},`)

            writeFileSync(file, src)

            res.setHeader('Content-Type', 'application/json')
            res.setHeader('Access-Control-Allow-Origin', '*')
            res.end(JSON.stringify({ ok: true }))
          } catch (err) {
            res.statusCode = 500
            res.end(JSON.stringify({ error: err.message }))
          }
        })
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), devConfigPlugin()],
})
