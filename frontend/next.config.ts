import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api-apis-net-pe/:path*',
        destination: 'https://api.apis.net.pe/v1/:path*',
      },
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL 
          ? `${process.env.NEXT_PUBLIC_API_URL}/:path*` 
          : 'http://127.0.0.1:4000/api/:path*',
      },
    ];
  },
};

export default nextConfig;
