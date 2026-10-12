/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com', 'illustrations.popsy.co'],
    unoptimized: true,
  },
};

export default nextConfig;
