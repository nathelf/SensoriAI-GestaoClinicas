import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

/** Carrega o CSS principal de forma não bloqueante (melhora FCP/LCP). */
function deferMainCss() {
  return {
    name: "defer-main-css",
    transformIndexHtml(html: string) {
      return html.replace(
        /<link(\s[^>]*?href="[^"]*index[^"]*\.css"[^>]*)>/i,
        (match) => {
          if (match.includes('media="print"')) return match;
          return match.replace(/^<link/, '<link media="print" onload="this.media=\'all\'"');
        }
      );
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    include: ["react", "react-dom"],
  },
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), deferMainCss()],
  build: {
    target: "es2020",
    sourcemap: true,
    minify: "esbuild",
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React primeiro para evitar "Class extends value undefined" em libs que estendem Component
          if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/")) return "react";
          if (id.includes("node_modules/framer-motion")) return "framer";
          if (id.includes("node_modules/@radix-ui") || id.includes("node_modules/radix-ui")) return "radix";
          if (id.includes("node_modules/jspdf") || id.includes("node_modules/html2canvas") || id.includes("node_modules/jszip") || id.includes("node_modules/canvg")) return "pdf";
          if (id.includes("node_modules/react-quill") || id.includes("node_modules/quill")) return "quill";
          if (id.includes("node_modules")) return "vendor";
        },
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
    reportCompressedSize: true,
  },
});
