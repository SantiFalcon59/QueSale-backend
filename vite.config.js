import { defineConfig } from 'vite';

export default defineConfig({
  ssr: {
    target: 'node',
    noExternal: [],
  },
  build: {
    lib: false,
    rollupOptions: {
      input: 'src/server.js',
      output: {
        format: 'es',
        dir: 'dist',
      },
      external: ['express', 'mysql2', 'socket.io', 'firebase-admin'],
    },
  },
});
