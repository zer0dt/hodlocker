import './globals.css'
import type { Metadata } from 'next'
import { Roboto_Flex } from 'next/font/google'

import NextAuthProvider from './context/NextAuthProvider'
import { WalletContextProvider } from './context/WalletContextProvider'
import ProgressBarProvider from './context/ProgressBarProvider'

import NavBar from './components/navbar/NavBar'
import AppBar from './components/appbar/AppBar'

import { Toaster } from 'sonner';

import { Analytics } from '@vercel/analytics/react';
import { Suspense } from 'react'

import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"


const inter = Roboto_Flex({ subsets: ['latin'] })

export const metadata: Metadata = {
  manifest: "/manifest.json",
  title: "Enter the center of Bitcoin.",
  description: "Rank content by locking bitcoin on the on-chain social platform.",
  openGraph: {
    title: "Enter the center of Bitcoin.",
    description: "Rank content by locking bitcoin on the on-chain social platform.",
    images: ["/townsquare.png"],
    url: "https://hodlocker.com",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const session = await getServerSession(authOptions)

  return (
    <html lang="en" style={{ scrollBehavior: 'smooth' }}>

      <body className={inter.className}>
        
        <NextAuthProvider session={session}>
          <WalletContextProvider>

            <ProgressBarProvider>
              <NavBar />
                {children}
              <Toaster richColors position="top-center" />
              <Analytics />
              <AppBar />
            </ProgressBarProvider>

          </WalletContextProvider>
        </NextAuthProvider>


      </body>
    </html>
  )
}
