import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  images: {
    formats: ['image/avif', 'image/webp'],
  },

  typedRoutes: true,

  experimental: {
    webpackBuildWorker: false,
  },

  webpack: (config) => {
    config.module?.rules?.push({
      test: /\.(glsl|vs|fs)$/,
      type: 'asset/source',
    })

    return config
  },
}

export default nextConfig
