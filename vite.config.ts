import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

const projectRoot = path.resolve(__dirname);
// Alias para a pasta do pacote (não para index.js), senão "react/jsx-runtime" vira ".../react/index.js/jsx-runtime" e quebra
const reactDir = path.join(projectRoot, "node_modules/react");
const reactDomDir = path.join(projectRoot, "node_modules/react-dom");

/** Só em dev: força react/react-dom (corrige forwardRef no lucide-react). */
function forceReactResolution() {
  return {
    name: "force-react-resolution",
    enforce: "pre",
    resolveId(id: string) {
      if (id === "react") return path.join(reactDir, "index.js");
      if (id === "react-dom") return path.join(reactDomDir, "index.js");
      if (id === "react/jsx-runtime") return path.join(reactDir, "jsx-runtime.js");
      if (id === "react/jsx-dev-runtime") return path.join(reactDir, "jsx-dev-runtime.js");
      return null;
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: command === "build" ? [react()] : [forceReactResolution(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Pasta do pacote para que "react" e "react/jsx-runtime" resolvam corretamente
      react: reactDir,
      "react-dom": reactDomDir,
    },
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    include: ["react", "react-dom"],
    exclude: ["lucide-react"],
  },
  build: {
    target: "es2020",
    sourcemap: true,
    minify: "esbuild",
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules/react") || id.includes("node_modules/react-dom")) return "react";
          // lucide-react no mesmo chunk que React para evitar "forwardRef undefined" em produção
          if (id.includes("node_modules/lucide-react")) return "react";
          if (id.includes("node_modules/framer-motion")) return "framer";
          if (id.includes("node_modules/@radix-ui") || id.includes("node_modules/radix-ui")) return "radix";
          if (id.includes("node_modules")) return "vendor";
        },
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
    reportCompressedSize: true,
  },
}));
