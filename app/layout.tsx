import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { AuthProvider } from '@/lib/auth-context'
import { RegionProvider } from '@/lib/region-context'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

export const metadata: Metadata = {
  title: 'Swapify CRM - Admin Dashboard',
  description: 'Secure admin panel for Swapify CRM',
  generator: 'Next.js',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <AuthProvider>
          <RegionProvider>
            {children}
            <Toaster />
          </RegionProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
