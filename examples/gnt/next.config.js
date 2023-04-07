/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['rickandmortyapi.com'],
  },
};

module.exports = nextConfig;
