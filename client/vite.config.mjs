import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const devProxy = {
  "/api": {
    target: "http://localhost:3001",
    changeOrigin: true,
  },
  "/uploads": {
    target: "http://localhost:3001",
    changeOrigin: true,
  },
};

export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    exclude: ["pdfmake/build/vfs_fonts.js"],
  },
  server: {
    port: 3000,
    proxy: devProxy,
  },
  /** `vite preview` không dùng server.proxy trừ khi khai báo lại */
  preview: {
    port: 3000,
    proxy: devProxy,
  },
});

