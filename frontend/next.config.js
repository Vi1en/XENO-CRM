/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true
  },
  // Ensure proper routing for Render
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/',
      },
    ]
  },
  // Add debugging
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
}

module.exports = nextConfig