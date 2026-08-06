/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    // Proxy API calls to the backend during development so the frontend
    // can call relative /api/... paths without CORS friction.
    return [
      {
        source: "/backend-uploads/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"}/uploads/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
