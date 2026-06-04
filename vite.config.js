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
              .replace(/const FAB_THEME\s*=\s*'[^']*'/, `const FAB_THEME          = '${c.fabTheme}'`)
              .replace(/const MODAL_THEME\s*=\s*'[^']*'/, `const MODAL_THEME        = '${c.modalTheme}'`)
              .replace(/const FAB_SHADOW_OPACITY\s*=\s*\d+/, `const FAB_SHADOW_OPACITY = ${c.shadowOpacity}`)
              .replace(/const FAB_SCROLL_TRIGGER\s*=\s*\d+/, `const FAB_SCROLL_TRIGGER = ${c.scrollTrigger}`)
              .replace(/const FAB_START_DELAY\s*=\s*\d+/,   `const FAB_START_DELAY    = ${c.startDelay}`)
              .replace(/const FAB_CONDENSE_DELAY\s*=\s*\d+/, `const FAB_CONDENSE_DELAY = ${c.condenseDelay}`)
              .replace(/const FAB_MORPH_DURATION\s*=\s*\d+/, `const FAB_MORPH_DURATION = ${c.morphDuration}`)
              .replace(/const FAB_ENTER_DURATION\s*=\s*\d+/, `const FAB_ENTER_DURATION = ${c.enterDuration}`)
              .replace(/const FAB_EXIT_DURATION\s*=\s*\d+/,  `const FAB_EXIT_DURATION  = ${c.exitDuration}`)
              .replace(/const FAB_DISMISS_TIMER\s*=\s*(null|\d+)/, `const FAB_DISMISS_TIMER  = ${c.dismissTimer ?? 'null'}`)
              .replace(/const FAB_SHOW_CLOSE_BTN\s*=\s*(true|false)/, `const FAB_SHOW_CLOSE_BTN = ${c.showCloseButton ?? true}`)

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
