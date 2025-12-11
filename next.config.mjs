/** @type {import('next').NextConfig} */
const nextConfig = {
  // 启用 standalone 输出模式（用于 Docker 部署）
  output: 'standalone',

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
