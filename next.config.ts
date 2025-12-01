import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'https', hostname: 'xvddulfhkviiblidoiaq.supabase.co' },
      { protocol: 'https', hostname: 'promptpay.io' },
    ],
  },

};

export default nextConfig;
