import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@packages/events': path.resolve(__dirname, '../packages/events/src/index.ts'),
      '@packages/events/': path.resolve(__dirname, '../packages/events/src/'),
      '@packages/auth': path.resolve(__dirname, '../packages/auth/src/index.ts'),
      '@packages/auth/': path.resolve(__dirname, '../packages/auth/src/'),
      '@packages/rbac': path.resolve(__dirname, '../packages/rbac/src/index.ts'),
      '@packages/rbac/': path.resolve(__dirname, '../packages/rbac/src/'),
      '@packages/data': path.resolve(__dirname, '../packages/data/src/index.ts'),
      '@packages/data/': path.resolve(__dirname, '../packages/data/src/'),
      '@packages/template': path.resolve(__dirname, '../packages/template/template_setup.ts'),
      '@packages/template/': path.resolve(__dirname, '../packages/template/'),
      '@packages/standards': path.resolve(__dirname, '../packages/standards/src/index.ts'),
      '@packages/standards/': path.resolve(__dirname, '../packages/standards/src/'),
    },
  },
});
