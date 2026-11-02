import type { NextConfig } from "next";
import { BACKOFFICE_PATH } from "./src/config/backoffice";

/** Backoffice pages and admin APIs: never indexed, cached, framed, or leaked via Referer. */
const privateHeaders = [
  { key: "X-Robots-Tag", value: "noindex, nofollow" },
  { key: "Cache-Control", value: "no-store" },
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "X-Frame-Options", value: "DENY" },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: ["mapbox-gl"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co", pathname: "/storage/v1/object/public/**" },
      { protocol: "https", hostname: "**.r2.dev", pathname: "/**" },
    ],
  },
  async headers() {
    return [
      { source: BACKOFFICE_PATH, headers: privateHeaders },
      { source: `${BACKOFFICE_PATH}/:path*`, headers: privateHeaders },
      { source: "/api/admin/:path*", headers: privateHeaders },
    ];
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
