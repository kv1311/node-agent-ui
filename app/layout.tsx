import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Space_Grotesk } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const cormorantGaramond = Cormorant_Garamond({ 
  subsets: ["latin"],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cormorant',
})

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  weight: ['400', '500', '600', '700'],
  variable: '--font-space',
})

export const metadata: Metadata = {
  title: 'Sia - Personal Agent',
  description: 'Your personal AI agent for tasks, reminders, and more',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#080f09',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${cormorantGaramond.variable} ${spaceGrotesk.variable}`} style={{ backgroundColor: '#080f09' }}>
      <body className="antialiased" style={{ backgroundColor: '#080f09', color: '#ede8df' }}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
