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

  // 关键：确保静态资源路径正确（避免 MIME 错误）
  base: './',

  build: {
    outDir: 'dist',
    emptyOutDir: true,

    // 使用 Vite 官方推荐的资源结构（避免 Netlify header 冲突）
    assetsDir: 'assets',

    rollupOptions: {
      output: {
        // 所有 JS 放到 assets 下，而不是 assets/js
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },

    target: 'es2020',
  },

  define: {
    __VUE_OPTIONS_API__: false,
    __VUE_PROD_DEVTOOLS__: false,
  },

  esbuild: {
    target: 'es2020'
  }
})
