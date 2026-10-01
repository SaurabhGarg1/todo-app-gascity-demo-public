import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import pkg from './package.json'

const basePath = pkg.homepage.replace(/^https?:\/\/[^/]+/, '') || '/'
const base = basePath.endsWith('/') ? basePath : `${basePath}/`

export default defineConfig({
  plugins: [react()],
  base,
})
