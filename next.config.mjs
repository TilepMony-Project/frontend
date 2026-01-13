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
          loader: "@svgr/webpack",
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
        net: false,
        tls: false,
      };
    }

    // Ignore optional dependencies that are not needed for web
    // Alias Node-focused logging deps to browser-safe versions
    config.resolve.alias = {
      ...config.resolve.alias,
      "@react-native-async-storage/async-storage": false,
      "pino-pretty": false,
      "thread-stream": false,
      "encoding": false,
      "lokijs": false,
      // pino: "pino/browser", // Rely on pino's package.json browser field instead
    };

    // Ignore warnings for optional peer dependencies
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      { module: /@react-native-async-storage\/async-storage/ },
      { module: /pino-pretty/ },
      { module: /encoding/ },
      { module: /lokijs/ },
    ];

    return config;
  },
  experimental: {},
  // Turbopack configuration
  // Note: Currently using webpack for SVG handling via @svgr/webpack
  // Add turbopack config here when migrating from webpack
  turbopack: {
    // Keep Turbopack aligned with the webpack aliases above
    // These are needed for @privy-io/wagmi and WalletConnect dependencies
    resolveAlias: {
      // Redirect pino to browser-safe version
      // pino: "pino/browser", // Let's rely on browser field
      "thread-stream": "pino/browser", // Hack? No, just remove it or map to something safe? 
      // Turbopack alias support is limited, keeping pino/browser if failing
      pino: "pino/browser", 
    },
  },
};

export default nextConfig;
