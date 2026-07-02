import type { Metadata } from 'next'
import { Inter, JetBrains_Mono as JetBrainsMono } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
})

const jetbrainsMono = JetBrainsMono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  fallback: ['monospace'],
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'SaiVerse — An Interactive 3D Adventure',
    template: '%s | SaiVerse',
  },
  description:
    "Explore Sai's engineering journey through an immersive browser-based 3D adventure game. No scrolling. No boring cards. Just exploration.",
  keywords: [
    'portfolio',
    '3d',
    'game',
    'software engineer',
    'react three fiber',
    'next.js',
    'interactive',
  ],
  authors: [{ name: 'Saiteja Kommi' }],
  creator: 'Saiteja Kommi',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://saiverse.dev',
    siteName: 'SaiVerse',
    title: 'SaiVerse — An Interactive 3D Adventure',
    description:
      "Explore Sai's engineering journey through an immersive browser-based 3D adventure game.",
    images: [
      {
        url: '/icons/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'SaiVerse Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SaiVerse — An Interactive 3D Adventure',
    description:
      "Explore Sai's engineering journey through an immersive browser-based 3D adventure game.",
    images: ['/icons/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/icons/apple-touch-icon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  )
}
