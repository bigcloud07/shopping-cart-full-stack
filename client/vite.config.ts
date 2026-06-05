import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/cart": {
        target: process.env.API_TARGET ?? "http://localhost:3000",
        changeOrigin: true,
      },
      "/products": {
        target: process.env.API_TARGET ?? "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
