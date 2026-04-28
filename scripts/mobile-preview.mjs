import { mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'
import { chromium, devices } from '@playwright/test'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(__dirname, '..')
const outputDir = resolve(projectRoot, 'mobile-previews')
const port = 5181
const baseUrl = `http://127.0.0.1:${port}`

const deviceMatrix = [
  ['iphone-15', devices['iPhone 15']],
  ['iphone-se', devices['iPhone SE']],
  ['pixel-7', devices['Pixel 7']],
]

const states = [
  {
    name: 'root',
    action: async () => {},
  },
  {
    name: 'about',
    action: async (page) => {
      await page.getByRole('button', { name: /cd \/company/i }).first().click()
      await page.getByRole('button', { name: /about/i }).first().click()
    },
  },
  {
    name: 'more-info',
    action: async (page) => {
      await page.getByRole('button', { name: /cd \/company/i }).first().click()
      await page.getByRole('button', { name: /more info/i }).first().click()
    },
  },
]

function waitForServer(url, timeoutMs = 15000) {
  const started = Date.now()

  return new Promise((resolveWait, rejectWait) => {
    const tick = async () => {
      try {
        const response = await fetch(url)
        if (response.ok) {
          resolveWait()
          return
        }
      } catch {
        // Keep polling until Vite is ready.
      }

      if (Date.now() - started > timeoutMs) {
        rejectWait(new Error(`Timed out waiting for ${url}`))
        return
      }

      setTimeout(tick, 250)
    }

    tick()
  })
}

const server = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(port)], {
  cwd: projectRoot,
  stdio: 'ignore',
})

try {
  await mkdir(outputDir, { recursive: true })
  await waitForServer(baseUrl)

  const browser = await chromium.launch({ channel: 'chrome' })

  for (const [deviceName, device] of deviceMatrix) {
    for (const state of states) {
      const context = await browser.newContext(device)
      const page = await context.newPage()

      await page.goto(baseUrl)
      await state.action(page)
      await page.screenshot({
        fullPage: true,
        path: resolve(outputDir, `${deviceName}-${state.name}.png`),
      })

      await context.close()
    }
  }

  await browser.close()
  console.log(`Wrote mobile previews to ${outputDir}`)
} finally {
  server.kill()
}

