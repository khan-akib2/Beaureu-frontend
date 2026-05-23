/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  // Suppress the middleware->proxy deprecation warning (root middleware.js is correct for App Router)
  experimental: {
    proxyPrefetch: "flexible",
    workerThreads: false,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "api.dicebear.com" },
      { protocol: "https", hostname: "source.unsplash.com" },
    ],
  },
};

export default nextConfig;
