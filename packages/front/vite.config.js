// vite.config.js
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default {
  plugins: [react()],
  build: {
    lib: {
      entry: path.resolve(process.cwd(), 'src/index.js'),
      name: 'yaml-admin-front',
      fileName: (f) => `index.${f}.js`,
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: { globals: { react: 'React', 'react-dom': 'ReactDOM' } },
    },
  },
};