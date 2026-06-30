/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/matches",
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
