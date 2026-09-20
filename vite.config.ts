// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: false, // we register via virtual:pwa-register in client code
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "icon-192.png", "icon-512.png", "icon-maskable-512.png"],
      // TanStack Start + nitro tunnel the client build into .output/public, so
      // emit sw.js/manifest there too and precache the real assets inside it.
      outDir: ".output/public",
      manifest: {
        name: "Oromia Academy — Barnoota Teeknoolojii fi Qormaata Dijitaalaa",
        short_name: "OromiaAcademy",
        description:
          "Afaan Oromoo-first technology education and digital examinations, installable on any device.",
        lang: "om",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "any",
        background_color: "#07251e",
        theme_color: "#13795f",
        categories: ["education", "productivity"],
        icons: [
          { src: "/favicon.ico", sizes: "16x16 32x32 48x48 64x64 128x128 256x256", type: "image/x-icon" },
          { src: "/favicon.ico", sizes: "192x192", type: "image/x-icon", purpose: "any maskable" },
          { src: "/favicon.ico", sizes: "512x512", type: "image/x-icon", purpose: "any maskable" },
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        shortcuts: [
          {
            name: "Dashboard",
            short_name: "Dash",
            url: "/dashboard",
            icons: [{ src: "/favicon.ico", sizes: "192x192", type: "image/x-icon" }],
          },
          {
            name: "Admin",
            short_name: "Admin",
            url: "/admin",
            icons: [{ src: "/favicon.ico", sizes: "192x192", type: "image/x-icon" }],
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webmanifest}"],
        navigateFallback: null,
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
});
