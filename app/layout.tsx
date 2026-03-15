import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'SENTINEL',
  description: 'Real-time Network Security Monitoring Dashboard for Suricata IDS',
  generator: 'v0.app',
  icons: {
    icon: '/icon.svg',
  },
}

import Script from 'next/script'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
        <Script src="/chatbot.js" strategy="lazyOnload" />
      </body>
    </html>
  )
}
