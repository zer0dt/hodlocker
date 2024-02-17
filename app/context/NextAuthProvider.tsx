'use client'

import React from 'react'
import { SessionProvider } from "next-auth/react"

export default function NextAuthProvider ({
  children,
  session
}: {
  children: React.ReactNode
  session: any
}): React.ReactNode {
  return <SessionProvider session={session}>
    {children}
  </SessionProvider>
}