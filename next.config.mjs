/** @type {import('next').NextConfig} */
const appHost = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").host
  } catch {
    return "localhost:3000"
  }
})()

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Avatars, miniatures et images de projets sont des URL fournies par l'utilisateur.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  experimental: {
    serverActions: {
      // Derrière le proxy PHP cPanel, l'en-tête Host vaut localhost:3000 :
      // on autorise explicitement le domaine public pour les server actions.
      allowedOrigins: ["localhost:3000", appHost, "linkfree.tmktools.com"],
    },
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ]
  },
}

export default nextConfig
