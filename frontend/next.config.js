/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable static export for development
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  distDir: process.env.NODE_ENV === 'production' ? 'out' : '.next',
  trailingSlash: process.env.NODE_ENV === 'production',
  images: {
    unoptimized: true
  },
}

module.exports = nextConfig