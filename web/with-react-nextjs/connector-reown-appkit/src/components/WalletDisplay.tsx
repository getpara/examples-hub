'use client'

import { useAppKitAccount, useAppKitNetwork, useDisconnect } from '@reown/appkit/react'
import { useBalance } from 'wagmi'
import { useEffect, useState } from 'react'

export function WalletDisplay() {
  const { address, isConnected, caipAddress, status } = useAppKitAccount()
  const { caipNetwork, caipNetworkId, chainId } = useAppKitNetwork()
  const { disconnect } = useDisconnect()
  const { data: balanceData } = useBalance({
    address: address as `0x${string}` | undefined,
  })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  if (!isConnected) {
    return (
      <div className="bg-gray-100 rounded-lg p-6 max-w-md mx-auto">
        <p className="text-gray-600 text-center">No wallet connected</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Wallet Information</h2>
      
      <div className="space-y-2">
        <div className="flex flex-col">
          <span className="text-sm text-gray-600">Status</span>
          <span className="font-mono text-sm">
            {status === 'connected' ? '🟢 Connected' : '🔴 Disconnected'}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-sm text-gray-600">Address</span>
          <span className="font-mono text-sm break-all">{address}</span>
        </div>

        <div className="flex flex-col">
          <span className="text-sm text-gray-600">CAIP Address</span>
          <span className="font-mono text-sm break-all">{caipAddress}</span>
        </div>

        <div className="flex flex-col">
          <span className="text-sm text-gray-600">Network</span>
          <span className="font-mono text-sm">
            {caipNetwork?.name || 'Unknown'} (Chain ID: {chainId})
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-sm text-gray-600">Balance</span>
          <span className="font-mono text-sm">
            {balanceData?.formatted} {balanceData?.symbol}
          </span>
        </div>
      </div>

      <button
        onClick={() => disconnect()}
        className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
      >
        Disconnect
      </button>
    </div>
  )
}