import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import CustomCursor from './components/CustomCursor'
import ScrollProgress from './components/ScrollProgress'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata = {
  title: 'Elevate Salon — Premium Barbershop Products',
  description: 'Professional grooming products curated for the modern gentleman.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <CustomCursor />
        <ScrollProgress />
        {children}
      </body>
    </html>
  )
}
