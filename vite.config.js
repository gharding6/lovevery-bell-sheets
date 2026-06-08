import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Set base so the built app works when hosted from a GitHub Pages subpath
  // (e.g. https://<user>.github.io/lovevery-bell-sheets/). For local dev this is ignored.
  base: process.env.GITHUB_PAGES ? '/lovevery-bell-sheets/' : '/',
})
