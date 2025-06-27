import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useAccount, useWallet, useSignMessage, useModal } from '@getpara/react-sdk'
import { ConnectWalletCard } from '~/components/ui/ConnectWalletCard'
import { SignMessageForm } from '~/components/ui/SignMessageForm'
import { SignatureDisplay } from '~/components/ui/SignatureDisplay'
import { StatusAlert } from '~/components/ui/StatusAlert'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const [message, setMessage] = useState('')

  const { data: account } = useAccount()
  const { data: wallet } = useWallet()
  const { openModal } = useModal()
  const signMessageHook = useSignMessage()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!wallet?.id) {
      return
    }

    signMessageHook.signMessage({
      walletId: wallet.id,
      messageBase64: btoa(message),
    })
  }

  // Reset signature when message changes
  const handleMessageChange = (value: string) => {
    setMessage(value)
    if (signMessageHook.data) {
      signMessageHook.reset()
    }
  }

  // Derive status from signing state
  const status = {
    show: signMessageHook.isPending || !!signMessageHook.error || !!signMessageHook.data,
    type: signMessageHook.isPending ? ("info" as const) : signMessageHook.error ? ("error" as const) : ("success" as const),
    message: signMessageHook.isPending
      ? "Signing message..."
      : signMessageHook.error
      ? signMessageHook.error.message || "Failed to sign message. Please try again."
      : "Message signed successfully!",
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Para Wallet Integration</h1>
          <p className="text-gray-600">Connect your wallet and sign messages</p>
        </div>

        <StatusAlert show={status.show} type={status.type} message={status.message} />

        {!account?.isConnected ? (
          <ConnectWalletCard onConnect={openModal} />
        ) : (
          <>
            <StatusAlert
              show={true}
              type="success"
              message={`Connected - ${wallet?.address?.slice(0, 6)}...${wallet?.address?.slice(-4)}`}
            />
            <SignMessageForm
              message={message}
              onMessageChange={handleMessageChange}
              onSubmit={handleSubmit}
              isLoading={signMessageHook.isPending}
            />
            {signMessageHook.data && "signature" in signMessageHook.data && <SignatureDisplay signature={signMessageHook.data.signature} />}
          </>
        )}
      </div>
    </div>
  )
}
