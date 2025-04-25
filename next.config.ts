const nextConfig = {
  webpack(config: any, context: any) {
    if (!context.isServer) {
      config.resolve = config.resolve || {};
      config.resolve.fallback = {
        fs: false,
        tls: false,
        net: false,
        dgram: false,
        dns: false,
      };
    }

    if (process.env.VERCEL_ENV === "preview") {
      if (config.optimization) config.optimization.minimize = false;
    }

    return config;
  },
  experimental: {
    turbo: {
      root: "..",
      resolveAlias: {
        "@drift-labs/sdk": "../drift-common/protocol/sdk",
        "@drift-labs/icons": "../drift-common/icons/dist/",
        "@drift/common": "../drift-common/common-ts/lib/index.js",
        "@drift-labs/react": "../drift-common/react/lib/index.js",
        react: "./node_modules/@types/react",
        fs: { browser: "./node-browser-compatibility.js" },
        net: { browser: "./node-browser-compatibility.js" },
        dns: { browser: "./node-browser-compatibility.js" },
        tls: { browser: "./node-browser-compatibility.js" },
        crypto: { browser: "crypto-browserify" },
      },
      rules: {
        "*.svg": {
          loaders: ["@svgr/webpack"],
          as: "*.js",
        },
      },
    },
  },
};

module.exports = nextConfig;
