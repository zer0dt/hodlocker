import './globals.css'
import type { Metadata } from 'next'
import { Roboto_Flex } from 'next/font/google'

import { WalletContextProvider } from './context/WalletContextProvider'
import ProgressBarProvider from './context/ProgressBarProvider'

import NavBar from './components/navbar/NavBar'
import AppBar from './components/appbar/AppBar'

import { Toaster } from 'sonner';

import { Analytics } from '@vercel/analytics/react';
import { Suspense } from 'react'
import Loading from './(home)/loading'


const inter = Roboto_Flex({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  manifest: "/manifest.json",
  title: "Enter the center of Bitcoin.",
  openGraph: {
    title: "Enter the center of Bitcoin.",
    images: ["/locked.jpg"]
  }
};


export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <html lang="en" style={{ scrollBehavior: 'smooth' }}>

      <body className={inter.className}>
        <Suspense fallback={<Loading />}>
          <WalletContextProvider>
            <ProgressBarProvider>
              <NavBar />
              {children}
              <Toaster richColors position="top-center" />
              <Analytics />
              <AppBar />
            </ProgressBarProvider>
          </WalletContextProvider>
        </Suspense>

      </body>
    </html>
  )
}
