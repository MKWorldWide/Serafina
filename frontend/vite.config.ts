import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'analyze' && visualizer({
      open: true,
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 3000,
    host: true,
    cors: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production'
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@mui/material', '@emotion/react', '@emotion/styled'],
          aws: ['aws-amplify', '@aws-amplify/ui-react'],
          utils: ['date-fns', 'zustand', 'zod']
        },
        chunkFileNames: (chunkInfo) => {
          const name = chunkInfo.name === 'index' ? 'main' : chunkInfo.name;
          return mode === 'production'
            ? `assets/${name}.[hash].js`
            : `assets/${name}.js`;
        }
      }
    },
    target: 'esnext',
    assetsDir: 'assets',
    cssCodeSplit: true,
    modulePreload: true,
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@mui/material',
      '@emotion/react',
      '@emotion/styled',
      'aws-amplify',
      '@aws-amplify/ui-react',
      'date-fns',
      'zustand',
      'zod'
    ]
  },
  css: {
    modules: {
      localsConvention: 'camelCase'
    },
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer')
      ]
    }
  },
  esbuild: {
    jsxInject: `import React from 'react'`
  }
}));
