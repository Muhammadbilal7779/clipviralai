import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ClipViralAI — Viral Shorts Generator',
  description: 'Koi bhi video ko viral shorts mein badlein. Sirf $1 mein 8 shorts!',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, fontFamily: 'Inter, system-ui, sans-serif' }}>{children}</body>
    </html>
  )
}
