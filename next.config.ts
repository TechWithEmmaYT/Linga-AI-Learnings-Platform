import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "krx7nxt3.us-east.insforge.app",
      }
    ]
  },
};

export default nextConfig;
