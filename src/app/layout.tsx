import type { Metadata } from 'next'
import './global.css'
import ThemeRegistry from './components/ThemeRegistry/ThemeRegistry'
import { Navbar } from './components/Navbar'

export const metadata: Metadata = {
  title: 'Imersão Fullcycle - Sistema de rastreio de veículos',
  description: 'Generated by create next app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <Navbar />
          {children}
        </ThemeRegistry>
      </body>
    </html>
  )
}
