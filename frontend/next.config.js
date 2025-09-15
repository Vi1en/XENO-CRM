/** @type {import('next').NextConfig} */
const isProduction = process.env.NODE_ENV === 'production'

const nextConfig = {
  // Only use static export for production builds
  ...(isProduction && {
    output: 'export',
    distDir: 'out',
    trailingSlash: true,
  }),
  images: {
    unoptimized: true
  },
  // Only generate build ID for production
  ...(isProduction && {
    generateBuildId: async () => {
      return 'demo-mode-v5-' + Date.now()
    },
  }),
}

module.exports = nextConfig