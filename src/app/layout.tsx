import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import "@/styles/globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "Linkfree — Votre hub intelligent et actionnable",
  description:
    "Centralisez vos liens, convertissez vos visiteurs. Linkfree est la plateforme link-in-bio moderne pour créateurs, freelances et marques.",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://linkfree.app",
    siteName: "Linkfree",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
