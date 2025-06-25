'use client'

import { useAppKitAccount, useAppKitNetwork, useDisconnect } from '@reown/appkit/react'
import { useBalance } from 'wagmi'

export function WalletDisplay() {
  const { address, isConnected } = useAppKitAccount()
  const { caipNetwork } = useAppKitNetwork()
  const { disconnect } = useDisconnect()
  const { data: balanceData } = useBalance({
    address: address as `0x${string}` | undefined,
  })

  if (!isConnected || !address) {
    return null
  }

  return (
    <div className="flex flex-col items-center gap-4 p-6 border border-gray-200 rounded-lg">
      <div className="text-center">
        <p className="text-sm text-gray-600">Connected Address</p>
        <p className="font-mono text-sm">{address}</p>
      </div>
      
      <div className="text-center">
        <p className="text-sm text-gray-600">Network</p>
        <p className="text-sm">{caipNetwork?.name || 'Unknown'}</p>
      </div>
      
      <div className="text-center">
        <p className="text-sm text-gray-600">Balance</p>
        <p className="text-sm">
          {balanceData?.formatted} {balanceData?.symbol}
        </p>
      </div>
      
      <button
        onClick={() => disconnect()}
        className="px-4 py-2 text-sm bg-red-500 text-white hover:bg-red-600 rounded"
      >
        Disconnect
      </button>
    </div>
  )
}