import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/setupTests.ts"],
    globals: true,
  },
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
