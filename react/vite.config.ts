import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import { visualizer } from 'rollup-plugin-visualizer';

const shouldAnalyze = process.env.ANALYZE === '1';


// https://vite.dev/config/
export default defineConfig({
  build: {
    chunkSizeWarningLimit: 1500, // TODO: default is 500
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'vendor';
            if (id.includes('chartjs') || id.includes('chart.js')) return 'charts';
            if (id.includes('jvectormap')) return 'maps';
          }
        }
      }
    }
  },
  plugins: [
    react(),
    ...(shouldAnalyze
        ? [
          visualizer({
            filename: 'dist/stats.html',
            open: !process.env.CI,  // open only in local dev
            gzipSize: true,
            brotliSize: true,
          }),
        ]
        : []),
    svgr({
      svgrOptions: {
        icon: true,
        // This will transform your SVG to a React component
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
  ],
});

