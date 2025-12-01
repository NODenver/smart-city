import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  // 部署根域名填 '/'，子路径（如 https://xxx.netlify.app/my-project/）填 '/my-project/'
  base: '/', 
  build: {
    outDir: 'dist', // 输出目录（Netlify 需指向此目录）
    emptyOutDir: true, // 构建前清空旧文件
    rollupOptions: {
      // 确保输出文件路径规范，避免扩展名解析错误
      output: {
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
  },
})
