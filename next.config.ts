import type { NextConfig } from "next";

/**
 * Enhanced Next.js configuration for WheelIt PWA
 * Optimized for performance, security, and user experience
 */
const nextConfig: NextConfig = {
  // Image optimization settings for better performance
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Experimental features for better performance
  experimental: {
    // optimizeCss: true, // Commented out due to missing 'critters' dependency
    optimizePackageImports: ['lucide-react', '@radix-ui/react-slot', '@radix-ui/react-label'],
  },

  // Compression and caching
  compress: true,

  // PWA and web app optimizations
  poweredByHeader: false,
  
  // Security and performance headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Security headers
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), gyroscope=(), accelerometer=(), magnetometer=()',
          },
          // Performance headers
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
      // Caching for static assets
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*\\.(ico|png|jpg|jpeg|webp|avif|svg|gif|woff|woff2|ttf|otf|eot)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Audio files caching (for sounds)
      {
        source: '/sounds/:path*\\.(mp3|wav|ogg|m4a)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400',
          },
        ],
      },
      // API routes caching
      {
        source: '/api/og',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=86400',
          },
        ],
      },
    ];
  },

  // Redirects for better SEO and user experience
  async redirects() {
    return [
      // Add any redirects you need here
      // Example: redirect old paths to new ones
    ];
  },

  // Webpack optimizations
  webpack: (config, { dev }) => {
    // Production optimizations
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks.cacheGroups,
            // Separate GSAP into its own chunk for better caching
            gsap: {
              test: /[\\/]node_modules[\\/]gsap[\\/]/,
              name: 'gsap',
              chunks: 'all',
              priority: 30,
            },
            // Separate Radix UI components
            radix: {
              test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
              name: 'radix',
              chunks: 'all',
              priority: 25,
            },
            // Common vendor libraries
            vendor: {
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
              name: 'vendor',
              chunks: 'all',
              priority: 20,
            },
          },
        },
      };
    }

    // Handle audio files
    config.module.rules.push({
      test: /\.(mp3|wav|ogg|m4a)$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/sounds/[name].[hash][ext]',
      },
    });

    return config;
  },

  // Environment variables (only if needed for build)
  env: {
    CUSTOM_BUILD_TIME: new Date().toISOString(),
  },

  // Standalone output for better deployment options
  output: 'standalone',

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
