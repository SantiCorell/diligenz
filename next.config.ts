import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "images.unsplash.com", pathname: "/**" },
    ],
  },
  // Optimizaciones para producción
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
};

export default nextConfig;
