import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@monaco-editor') || id.includes('monaco-editor')) {
              return 'vendor-monaco';
            }
            if (id.includes('@excalidraw') || id.includes('@tldraw')) {
              return 'vendor-whiteboard';
            }
            if (id.includes('cytoscape') || id.includes('katex') || id.includes('marked')) {
              return 'vendor-diagrams';
            }
            if (id.includes('tesseract.js') || id.includes('pdfjs-dist') || id.includes('mammoth') || id.includes('jszip') || id.includes('jspdf') || id.includes('html2canvas') || id.includes('html-to-image')) {
              return 'vendor-pdf-ocr';
            }
            if (id.includes('@iconify')) {
              return 'vendor-iconify';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-lucide';
            }
            if (id.includes('react') || id.includes('react-dom') || id.includes('motion') || id.includes('gsap')) {
              return 'vendor-core';
            }
            return 'vendor-misc';
          }
        }
      }
    }
  }
})
