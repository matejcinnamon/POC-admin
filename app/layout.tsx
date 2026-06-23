import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Utility Bills - Admin',
  description: 'Admin dashboard for Utility Bills',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
