/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use static export for Netlify
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  images: {
    unoptimized: true
  },
  // Cache busting for demo mode
  generateBuildId: async () => {
    return 'demo-mode-v5-' + Date.now()
  },
}

module.exports = nextConfig