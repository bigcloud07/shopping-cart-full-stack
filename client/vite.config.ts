import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    environmentOptions: {
      jsdom: {
        url: "http://localhost:3000",
      },
    },
    setupFiles: ["./src/setupTests.ts"],
    globals: true,
    env: {
      VITE_API_URL: "",
    },
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
      "/order": {
        target: process.env.API_TARGET ?? "http://localhost:3000",
        changeOrigin: true,
      },
      "/coupon": {
        target: process.env.API_TARGET ?? "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
