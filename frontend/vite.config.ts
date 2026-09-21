import fs from 'fs';
import path from 'path';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import dotenv from 'dotenv';
import { defineConfig } from 'vite';

let version: string;
try {
  version = fs
    .readFileSync(path.resolve(import.meta.dirname, './VERSION'), 'utf-8')
    .trim();
} catch {
  version = 'dev';
}

if ((process.env.PRODOC_ENV || 'dev') === 'dev') {
  dotenv.config({
    path: path.resolve(import.meta.dirname, '../.env.dev.example'),
  });
  if (fs.existsSync(path.resolve(import.meta.dirname, '../.env.dev'))) {
    dotenv.config({ path: path.resolve(import.meta.dirname, '../.env.dev') });
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
      routesDirectory: './src',
      virtualRouteConfig: './src/routes.ts',
      generatedRouteTree: './src/routeTree.gen.ts',
    }),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
  ],
  define: {
    __VERSION__: JSON.stringify(version),
  },
  // TODO
  optimizeDeps: {
    include: [
      'react',
      'react-dom/client',
      'react/jsx-runtime',
      'platejs',
      'platejs/react',
      '@platejs/ai',
      '@platejs/ai/react',
      '@platejs/markdown',
      '@ai-sdk/react',
      'ai',
      '@ai-sdk/openai-compatible',
      'zustand',
      '@tanstack/react-router',
      '@tanstack/react-query',
      'lucide-react',
      'motion/react',
      'lowlight',
      'date-fns',
      'recharts',
      'lodash/cloneDeep.js',
    ],
  },
  envPrefix: ['VITE_'],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/events': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:8000',
        ws: true,
        rewriteWsOrigin: true,
      },
    },
  },
});
