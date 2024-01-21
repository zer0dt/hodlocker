import './globals.css'
import type { Metadata } from 'next'
import { Roboto_Flex } from 'next/font/google'
import { Alumni_Sans } from 'next/font/google'

import { WalletContextProvider } from './context/WalletContextProvider'
import ProgressBarProvider from './context/ProgressBarProvider'

import NavBar from './components/navbar/NavBar'
import AppBar from './components/appbar/AppBar'

import { Toaster } from 'sonner';

import { Analytics } from '@vercel/analytics/react';
import { Suspense } from 'react'


const inter = Roboto_Flex({ subsets: ['latin'] })
const inter2 = Alumni_Sans({ subsets: ['latin'] })


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

  const fallback = () => {
    return (
      <div className="flex items-center justify-center min-h-screen">

        <div className="flex flex-col items-center space-x-2">
          <h1 className={inter2.className + " pb-4"}>
            <span className="pl-4 text-4xl font-bold dark:text-white">HL</span>
          </h1>
          <div className="flex items-center space-x-2">
            <svg className="animate-spin h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5a8 8 0 016.743-7.97 8.022 8.022 0 012.827 1.06A10 10 0 0022 12h-4a6 6 0 01-11.742 2.368A7.963 7.963 0 016 17z"></path>
            </svg>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>

      </div>
    )
  }

  return (
    <html lang="en" style={{ scrollBehavior: 'smooth' }}>

      <body className={inter.className}>
        <Suspense fallback={fallback()}>
          <WalletContextProvider>
            <ProgressBarProvider>
              <NavBar />
              <Suspense fallback={<p>test</p>}>
                {children}
              </Suspense>
              
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
