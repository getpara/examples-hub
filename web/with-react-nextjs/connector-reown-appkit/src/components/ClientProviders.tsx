'use client'

import { wagmiAdapter, projectId } from '@/config/appkit'
import { QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, cookieToInitialState } from 'wagmi'
import { ReactNode } from 'react'
import { queryClient } from '@/client/queryClient'

if (!projectId) {
  throw new Error('NEXT_PUBLIC_PROJECT_ID is not set')
}

export function ClientProviders({ 
  children,
  cookie
}: { 
  children: ReactNode
  cookie?: string | null
}) {
  const initialState = cookieToInitialState(
    wagmiAdapter.wagmiConfig,
    cookie
  )

  return (
    <WagmiProvider 
      config={wagmiAdapter.wagmiConfig}
      initialState={initialState}
    >
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}