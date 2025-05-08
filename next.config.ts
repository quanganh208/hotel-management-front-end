import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avkosajaqtmqjzkqxnkj.supabase.co",
      },
      {
        protocol: "https",
        hostname: "cdn-icons-png.flaticon.com",
      },
    ],
  },
};

export default nextConfig;
