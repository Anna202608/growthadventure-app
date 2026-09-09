import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/baidu': {
        target: 'https://aip.baidubce.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/baidu/, ''),
      },
      '/api/trans': {
        target: 'https://fanyi-api.baidu.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/trans/, ''),
      }
    }
  }
})