import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Replace 'myboard' below with whatever you name your GitHub repo
  base: '/https://github.com/jpgraziani/myboards.git/',
})
