import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // The app is served from the root of the custom domain.
  base: "/",
});
