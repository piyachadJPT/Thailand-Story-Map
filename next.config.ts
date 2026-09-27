import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: ["mapbox-gl"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co", pathname: "/storage/v1/object/public/**" },
      { protocol: "https", hostname: "**.r2.dev", pathname: "/**" },
    ],
  },
  async redirects() {
    return [
      { source: "/en", destination: "/", permanent: false },
      { source: "/th", destination: "/", permanent: false },
      { source: "/en/:path*", destination: "/:path*", permanent: false },
      { source: "/th/:path*", destination: "/:path*", permanent: false },
    ];
  },
};

export default nextConfig;
