import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s3.eu-west-2.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
    ],
  },

  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "talktosomto.xyz",
          },
        ],
        destination: "https://www.talktosomto.xyz/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
