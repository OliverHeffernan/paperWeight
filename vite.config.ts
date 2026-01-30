import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  base: process.env.NODE_ENV === 'production' ? '/' : '/',
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate Chart.js and related libraries into their own chunk
          'chart-libs': ['chart.js/auto', 'chartjs-adapter-date-fns', 'chartjs-plugin-trendline'],
          // Separate Vue ecosystem into its own chunk
          'vue-vendor': ['vue', 'vue-router'],
          // Separate Supabase into its own chunk
          'supabase': ['@supabase/supabase-js'],
          // Separate date utilities
          'date-utils': ['date-fns']
        }
      }
    },
    // Increase chunk size warning limit to be more reasonable
    chunkSizeWarningLimit: 1000
  },
  server: {
    port: 8080
  }
})
