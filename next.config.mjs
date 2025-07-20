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
}

export default nextConfig
