/** @type {import('next').NextConfig} */
const config = {
  async redirects() {
    return [
      {
        source: '/account/:address',
        destination: '/address/:address',
        permanent: true,
      },
    ];
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['arweave.net', 'cdn.helius-rpc.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  }
};

export default config;
