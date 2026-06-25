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
        destination: 'http://127.0.0.1:4000/api/:path*',
      },
    ];
  },
};

export default nextConfig;
