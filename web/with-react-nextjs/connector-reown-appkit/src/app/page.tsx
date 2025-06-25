'use client'

import { useState, useEffect } from 'react'
import { useAppKit, useAppKitAccount } from '@reown/appkit/react'
import { WalletDisplay } from '@/components/WalletDisplay'

export default function Home() {
  const { open } = useAppKit()
  const { isConnected } = useAppKitAccount()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 p-8">
      <h1 className="text-2xl font-bold">Reown AppKit with Para Example</h1>
      <p className="max-w-md text-center">
        This example demonstrates how to integrate Para as a custom wagmi connector in Reown AppKit.
      </p>
      
      {mounted && (
        <>
          {isConnected ? (
            <WalletDisplay />
          ) : (
            <p className="text-center">You are not logged in.</p>
          )}
          
          <button
            onClick={() => open()}
            className="rounded-none px-4 py-2 bg-blue-900 text-white hover:bg-blue-950"
          >
            {isConnected ? 'Open Account Modal' : 'Connect Wallet'}
          </button>
        </>
      )}
    </main>
  )
}