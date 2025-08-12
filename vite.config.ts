import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
<<<<<<< HEAD
  base: "/parllel_computing/",  // 👈 Add this
=======
  base: "/parllel_computing/", // ← Replace with your repo name
>>>>>>> a559842d2fbc7b14e00905e21345a66ed21ae556
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
<<<<<<< HEAD
    mode === 'development' && componentTagger(),
=======
    mode === "development" && componentTagger(),
>>>>>>> a559842d2fbc7b14e00905e21345a66ed21ae556
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
