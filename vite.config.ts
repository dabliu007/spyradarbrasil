import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    host: true,
    port: Number(process.env.DEV_PORT) || 3000,
    strictPort: true,
    allowedHosts: true,
  },
  plugins: [
    tsConfigPaths(),
    tailwindcss(),
    tanstackStart({
      // Custom SSR error-wrapping server entry lives at src/server.ts
      start: { entry: "server" },
    }),
    // Nitro emits the Vercel Build Output (.vercel/output) so the deployed
    // app is actually served in production. Vercel auto-detects the preset.
    nitro(),
    viteReact(),
  ],
});
