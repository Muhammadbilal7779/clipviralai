import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ClipViralAI — Viral Shorts Generator',
  description: 'Turn any video into viral shorts. Just $1 for 8 shorts per week!',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, fontFamily: 'Inter, system-ui, sans-serif' }}>{children}</body>
    </html>
  )
}
