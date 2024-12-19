module.exports = {
  async rewrites() {
    return [
      {
        source: ':path*', // Captura cualquier cosa bajo /assets
        destination: 'app/:path*', // Redirige al destino deseado
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
