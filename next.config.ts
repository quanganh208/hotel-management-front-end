import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["avkosajaqtmqjzkqxnkj.supabase.co"],
  },
  eslint: {
    // Bỏ qua các lỗi ESLint khi build (không nên dùng cho môi trường production nếu không kiểm tra kỹ)
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
