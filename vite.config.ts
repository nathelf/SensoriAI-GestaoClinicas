import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

const projectRoot = path.resolve(__dirname);
const reactDir = path.join(projectRoot, "node_modules/react");
const reactDomDir = path.join(projectRoot, "node_modules/react-dom");
const reactJsxRuntime = path.join(reactDir, "jsx-runtime.js");
const reactJsxDevRuntime = path.join(reactDir, "jsx-dev-runtime.js");

/** No build: resolve jsx-runtime antes de qualquer outro plugin (evita react/index.js/jsx-runtime na Vercel). */
function fixReactJsxResolution() {
  return {
    name: "fix-react-jsx-resolution",
    enforce: "pre" as const,
    resolveId(id: string) {
      if (id === "react/jsx-runtime") return reactJsxRuntime;
      if (id === "react/jsx-dev-runtime") return reactJsxDevRuntime;
      return null;
    },
  };
}

/** Só em dev: força react/react-dom (corrige forwardRef no lucide-react). */
function forceReactResolution() {
  return {
    name: "force-react-resolution",
    enforce: "pre" as const,
    resolveId(id: string) {
      if (id === "react") return path.join(reactDir, "index.js");
      if (id === "react-dom") return path.join(reactDomDir, "index.js");
      if (id === "react/jsx-runtime") return reactJsxRuntime;
      if (id === "react/jsx-dev-runtime") return reactJsxDevRuntime;
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
  plugins:
    command === "build"
      ? [fixReactJsxResolution(), react()]
      : [forceReactResolution(), react()],
  resolve: {
    alias: [
      { find: /^react\/jsx-runtime$/, replacement: reactJsxRuntime },
      { find: /^react\/jsx-dev-runtime$/, replacement: reactJsxDevRuntime },
      { find: "@", replacement: path.resolve(__dirname, "./src") },
      // Só em dev: alias react/react-dom para corrigir forwardRef no lucide-react
      ...(command === "build"
        ? []
        : [
            { find: /^react$/, replacement: path.join(reactDir, "index.js") },
            { find: /^react-dom$/, replacement: path.join(reactDomDir, "index.js") },
          ]),
    ],
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
