import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',
  define: {
    // Vite needs this to replace process.env.API_KEY in the source code.
    // We check both API_KEY and VITE_API_KEY for maximum compatibility.
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || process.env.VITE_API_KEY || "")
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
  server: {
    port: 3000
  }
});