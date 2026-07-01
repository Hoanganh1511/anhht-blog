import type { NextConfig } from "next";

const API = process.env.API_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  allowedDevOrigins: ["192.168.42.45"],
  async rewrites() {
    return [
      // Proxy auth — cookie sẽ được đặt trên domain của vercel.app thay vì railway.app
      { source: "/auth/:path*", destination: `${API}/auth/:path*` },
      // Proxy API cho client-side fetch (dùng khi NEXT_PUBLIC_API_URL=/api-proxy)
      { source: "/api-proxy/:path*", destination: `${API}/:path*` },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.amazonaws.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};

export default nextConfig;
