'use client'

import { useState, useEffect } from 'react'
import { useAppKit, useAppKitAccount } from '@reown/appkit/react'
import { WalletDisplay } from '@/components/WalletDisplay'
import Image from 'next/image'

export default function Home() {
  const { open } = useAppKit()
  const { isConnected } = useAppKitAccount()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-gray-900">
              Reown AppKit Example
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Connect your wallet using Reown AppKit with Next.js and Wagmi. 
              This example demonstrates wallet connection, state management, and network switching.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Image
              src="/reown.svg"
              alt="Reown logo"
              width={120}
              height={120}
              className="w-20 h-20"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>

          {mounted && (
            <div className="space-y-8 w-full max-w-md">
              {!isConnected ? (
                <button
                  onClick={() => open()}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  Connect Wallet
                </button>
              ) : (
                <div className="text-center">
                  <p className="text-green-600 font-semibold mb-4">
                    ✅ Wallet Connected Successfully!
                  </p>
                </div>
              )}

              <WalletDisplay />

              {isConnected && (
                <div className="text-center">
                  <button
                    onClick={() => open({ view: 'Account' })}
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    Open Account Modal
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="mt-16 text-center space-y-2">
            <p className="text-sm text-gray-600">
              Built with{' '}
              <a
                href="https://docs.reown.com/appkit/overview"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Reown AppKit
              </a>
              ,{' '}
              <a
                href="https://nextjs.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Next.js
              </a>
              , and{' '}
              <a
                href="https://wagmi.sh"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Wagmi
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}