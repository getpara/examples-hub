import { headers } from 'next/headers'
import { ClientProviders } from './ClientProviders'
import { ReactNode } from 'react'

export async function AppKitProvider({ 
  children
}: { 
  children: ReactNode
}) {
  const headersList = await headers()
  const cookie = headersList.get('cookie')

  return (
    <ClientProviders cookie={cookie}>
      {children}
    </ClientProviders>
  )
}