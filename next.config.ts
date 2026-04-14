import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.simplyrets.com" },
      { protocol: "https", hostname: "s3.amazonaws.com", pathname: "/cdn.simplyrets.com/**" },
      { protocol: "https", hostname: "cdn.simplyrets.com" },
      { protocol: "https", hostname: "media.brightmls.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
