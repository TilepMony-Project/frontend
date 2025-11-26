/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [],
  webpack: (config, { isServer }) => {
    // Handle SVG imports
    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            svgo: false,
          },
        },
      ],
    });

    // Handle web workers and browser-only modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }

    // Ignore optional dependencies that are not needed for web
    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-native-async-storage/async-storage': false,
      'pino-pretty': false,
    };

    // Ignore warnings for optional peer dependencies
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      { module: /@react-native-async-storage\/async-storage/ },
      { module: /pino-pretty/ },
    ];

    return config;
  },
  experimental: {
    // Enable if needed for specific features
  },
  // Turbopack configuration
  // Note: Currently using webpack for SVG handling via @svgr/webpack
  // Add turbopack config here when migrating from webpack
  turbopack: {},
};

export default nextConfig;

