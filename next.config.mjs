/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Add explicit output configuration
  output: 'standalone',
  // Ensure proper trailing slash handling
  trailingSlash: false,
  // Add explicit page extensions
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
  // Add rewrites for better routing
  async rewrites() {
    return [
      {
        source: '/health',
        destination: '/api/business-plans',
      },
    ]
  },
  // Add headers for better CORS handling
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },
}

export default nextConfig
