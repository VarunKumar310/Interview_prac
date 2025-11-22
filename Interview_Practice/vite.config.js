// vite.config.js  ←  FINAL VERSION (copy-paste this entire file)
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,
    open: true,
    host: true,
  },

  // THIS IS THE MAGIC PART — tells Vite to completely ignore local pdfjs worker
  optimizeDeps: {
    exclude: ["pdfjs-dist"], // ← prevents Vite from touching the worker at all
  },

  resolve: {
    alias: {
      // This stops the "rewrote pdf.worker.min.js" warning forever
      "pdfjs-dist/build/pdf.worker.min.js": false,
      "pdfjs-dist/build/pdf.worker": false,
    },
  },

  // Optional: silence large chunk warning (pdfjs is big)
  build: {
    chunkSizeWarningLimit: 1500,
  },
});