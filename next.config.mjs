/** @type {import('next').NextConfig} */

import webpack from "webpack";

const nextConfig = {
  staticPageGenerationTimeout: 3000,
  swcMinify: true,
  experimental: {
    ppr: true,
    serverActions: {
      bodySizeLimit: '3mb'
    },
  },
  logging: {
    fetches: {
      fullUrl: true,
    }
  },
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        port: '',
        pathname: '**', // Update this if you have a specific pattern
      },
      {
        protocol: 'https',
        hostname: 'a.relayx.com',
        port: '',
        pathname: '/u/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
        port: '',
        pathname: '**', // Update this if you have a specific pattern
      },
      {
        protocol: 'https',
        hostname: 'media.tenor.com',
        port: '',
        pathname: '**', // Update this if you have a specific pattern
      },
    ],
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        os: false,
        path: false,
        module: false,
      }
    }
    config.resolve.alias = {
      ...config.resolve.alias,
      formidable: false
    }
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
    })
    config.plugins.push(
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer']
      })
    )
    config.infrastructureLogging = {
      level: "error",
    }

    return config;
  }
}

export default nextConfig