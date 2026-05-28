/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  images: {
    domains: ["localhost", "storage.googleapis.com", "*.supabase.co"],
  },
  async headers() {
    return [
      {
        source: "/p/:slug*",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=60, stale-while-revalidate=300" },
        ],
      },
    ]
  },
}

export default nextConfig
