'use client';

import { useState } from 'react';
import { useModal, useWallet, useAccount } from '@getpara/react-sdk';
import '@getpara/react-sdk/styles.css';
import { WalletDisplay } from '@/components/ui/WalletDisplay';
import { StepCard } from '@/components/ui/StepCard';
import { Card } from '@/components/ui/Card';
import { StatusAlert } from '@/components/ui/StatusAlert';
import { Header } from '@/components/layout/Header';
import type { GenerateWalletResponse } from '@/lib/para/types';

export default function Home() {
  const { openModal } = useModal();
  const { data: wallet } = useWallet();
  const { isConnected, isLoading } = useAccount();

  const [email, setEmail] = useState('');
  const [pregenEmail, setPregenEmail] = useState('');
  const [pregenWalletAddress, setPregenWalletAddress] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [pregenError, setPregenError] = useState('');

  const handleGeneratePregenWallet = async () => {
    if (!email) {
      setPregenError('Please enter an email address');
      return;
    }

    setIsGenerating(true);
    setPregenError('');
    setPregenEmail('');
    setPregenWalletAddress('');

    try {
      const res = await fetch('/api/wallet/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const response: GenerateWalletResponse = await res.json();

      if (response.success && response.email && response.wallet?.address) {
        setPregenEmail(response.email);
        setPregenWalletAddress(response.wallet.address);
      } else {
        setPregenError(response.error || 'Failed to generate wallet');
      }
    } catch (e: unknown) {
      setPregenError(e instanceof Error ? e.message : 'Error generating wallet');
    }

    setIsGenerating(false);
  };

  return (
    <>
      <Header isPregenReady={!!pregenEmail} />
      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] gap-6 p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Para Pregen Wallet Claim</h1>
          <p className="text-gray-600 max-w-md">
            Generate a wallet server-side for an email, then sign in with that same email to automatically claim it
          </p>
        </div>
        <div className="w-full max-w-2xl flex flex-col gap-6">
          <StepCard
            stepNumber={1}
            title="Generate Pregen Wallet"
            description="Enter an email address to create a pre-generated wallet. The wallet will be claimable when the user authenticates with this same email."
            buttonLabel={isGenerating ? 'Generating...' : 'Generate Wallet'}
            disabled={isGenerating || isConnected || !email}
            onClick={handleGeneratePregenWallet}
            isComplete={!!pregenEmail}
          >
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="user@example.com"
                disabled={isConnected || !!pregenEmail}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            {pregenEmail && (
              <div className="text-sm mt-2 p-3 bg-gray-50 rounded-md">
                <p className="text-gray-600">
                  <span className="font-medium">Email:</span> {pregenEmail}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Address:</span> {pregenWalletAddress}
                </p>
              </div>
            )}
          </StepCard>
          <StepCard
            stepNumber={2}
            title="Authenticate with Para"
            description={
              pregenEmail
                ? `Sign in with ${pregenEmail} to automatically claim your pre-generated wallet.`
                : 'Sign in with Para using the same email to automatically claim your pre-generated wallet.'
            }
            buttonLabel="Open Para Modal"
            disabled={!pregenEmail || isLoading || isConnected}
            onClick={openModal}
            isComplete={isConnected}
          />
          {isConnected && (
            <Card className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Claimed Wallet</h3>
              <WalletDisplay walletAddress={wallet?.address} />
              {pregenEmail && wallet?.address === pregenWalletAddress && (
                <StatusAlert type="success" message="Pre-generated wallet successfully claimed!" className="mt-4" />
              )}
            </Card>
          )}
        </div>
        {pregenError && <StatusAlert type="error" message={pregenError} className="max-w-2xl mt-4" />}
      </main>
    </>
  );
}
