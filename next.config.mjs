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
};

export default config;
