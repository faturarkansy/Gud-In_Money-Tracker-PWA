import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  // swcMinify sudah dihapus dari sini karena sudah otomatis ditangani Next.js
});

const nextConfig: NextConfig = {
  // Memaksa penggunaan Webpack agar kompatibel dengan plugin PWA
  webpack: (config) => {
    return config;
  },
};

export default withPWA(nextConfig);
