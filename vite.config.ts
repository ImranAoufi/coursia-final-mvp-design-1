import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { API_BASE } from "./src/cofig";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,

    // 🧩 Proxy ergänzt — wichtig für Verbindung zu FastAPI
    proxy: {
      "/api": {
        target: "${API_BASE}", // dein FastAPI Backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));