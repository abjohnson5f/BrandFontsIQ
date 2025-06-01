/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  // Enable SWC minification (default in Next.js 15)
  swcMinify: true,
  // Experimental features available in stable
  experimental: {
    // Server Components are stable in Next.js 15
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

module.exports = nextConfig