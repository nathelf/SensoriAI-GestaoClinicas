import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

const projectRoot = path.resolve(__dirname);
const reactPath = path.join(projectRoot, "node_modules/react/index.js");
const reactDomPath = path.join(projectRoot, "node_modules/react-dom/index.js");

/** Só em dev: força react/react-dom (corrige forwardRef no lucide-react). No build fica desativado para o deploy não falhar. */
function forceReactResolution() {
  return {
    name: "force-react-resolution",
    enforce: "pre",
    resolveId(id: string) {
      if (id === "react") return reactPath;
      if (id === "react-dom") return reactDomPath;
      if (id === "react/jsx-runtime") return path.join(projectRoot, "node_modules/react/jsx-runtime.js");
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
      ...(command === "build" ? {} : { react: reactPath, "react-dom": reactDomPath }),
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
