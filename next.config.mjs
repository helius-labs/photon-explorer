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
      loader: 'custom',
      loaderFile: './src/utils/imageLoader.ts',
    },
  };
  
  export default config;
  