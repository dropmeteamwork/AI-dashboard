import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },

  server: {
    proxy: {
      "/api": {
        target: "https://web-ai-dashboard.up.railway.app",
        changeOrigin: true,
        secure: false,
        rewrite: (p) => p.replace(/^\/api/, "/ai_dashboard"),
      },
    },
  },

  build: {
    sourcemap: false,
    outDir: "dist",
    emptyOutDir: true,
  },
});
