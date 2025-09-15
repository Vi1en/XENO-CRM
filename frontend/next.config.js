/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true
  },
  // Railway optimizations
  experimental: {
    outputFileTracingRoot: undefined,
  },
  // Cache busting for demo mode
  generateBuildId: async () => {
    return 'demo-mode-v3-' + Date.now()
  },
  // Ensure proper routing
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/',
      },
    ]
  },
}

module.exports = nextConfig