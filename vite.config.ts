import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base works for both Project Pages (…/github.io/<repo>/) and a custom apex (e.g. simmer.com/).
// Set VITE_BASE_PATH only if you need an absolute subpath (must end with /).
const raw = process.env.VITE_BASE_PATH?.trim()
const base = raw ? raw.replace(/\/?$/, '/') : './'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base,
})
