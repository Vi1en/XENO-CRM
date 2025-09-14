/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  env: {
    NODE_ENV: 'production'
  }
}

module.exports = nextConfig