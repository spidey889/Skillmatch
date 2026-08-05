import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin Turbopack to this app when it is launched from a parent workspace.
  // This keeps PostCSS/Tailwind resolution inside skillmatch/node_modules.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
