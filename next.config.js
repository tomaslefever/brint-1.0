module.exports = {
  async rewrites() {
    return [
      {
        source: '/img/:path*',
        destination: '/app/img/:path*',
      },
    ];
  },

  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
};
