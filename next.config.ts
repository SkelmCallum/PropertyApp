import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.prop24.com',
      },
      {
        protocol: 'https',
        hostname: 'www.property24.com',
      },
      {
        protocol: 'https',
        hostname: 'www.privateproperty.co.za',
      },
      {
        protocol: 'https',
        hostname: 'helium.privateproperty.co.za',
      },
      {
        protocol: 'https',
        hostname: 'www.facebook.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pp.co.za',
      },
    ],
  },
};

export default nextConfig;
