import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

const projectRoot = path.resolve(__dirname);
const reactPath = path.join(projectRoot, "node_modules/react/index.js");
const reactDomPath = path.join(projectRoot, "node_modules/react-dom/index.js");

/** Plugin que força qualquer import de "react" ou "react-dom" a usar a cópia do projeto (corrige forwardRef undefined no lucide-react). */
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
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [forceReactResolution(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      react: reactPath,
      "react-dom": reactDomPath,
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
