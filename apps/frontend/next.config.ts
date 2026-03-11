/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@rdtr-spasial/shared'],

  // Output standalone for production
  output: 'standalone',

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },

  // Webpack configuration for Leaflet
  webpack: (config: any) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'leaflet': require.resolve('leaflet'),
    };
    return config;
  },
};

export default nextConfig;
