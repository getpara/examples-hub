'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import WalletGroup from '@/components/wallet-group';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Spinner } from '@/components/ui/spinner';
import WalletItem from '@/components/custom/wallet-item';

export default function WalletSelection() {
  const [selectedEthereumWallets, setSelectedEthereumWallets] = useState<string[]>(['wallet-1']);
  const [selectedSolanaWallets, setSelectedSolanaWallets] = useState<string[]>(['wallet-1']);
  const [selectedCosmosWallets, setSelectedCosmosWallets] = useState<string[]>(['wallet-1']);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [currentStep, setCurrentStep] = useState<'selection' | 'connecting' | 'success' | 'error'>('selection');

  const totalSelected = selectedEthereumWallets.length + selectedSolanaWallets.length + selectedCosmosWallets.length;

  const isDisabled = totalSelected === 0 || currentStep === 'connecting';

  const buttonText = isDisabled
    ? currentStep === 'connecting'
      ? 'Connecting...'
      : 'Select wallet'
    : `Connect ${totalSelected} wallets`;

  const handleConnect = async () => {
    // Check if any create wallets are selected
    // const hasCreateWallets =
    //   selectedEthereumWallets.includes('wallet-3') ||
    //   selectedSolanaWallets.includes('wallet-3') ||
    //   selectedCosmosWallets.includes('wallet-4');

    // Set state based on whether creating or just connecting
    setCurrentStep('connecting');

    try {
      // Simulate wallet connection/creation process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Here you would add your actual wallet connection logic
      console.log('Connecting wallets:', {
        ethereum: selectedEthereumWallets,
        solana: selectedSolanaWallets,
        cosmos: selectedCosmosWallets,
      });

      // After successful connection, you might want to:
      // - Close the popup
      // - Navigate to another page
      // - Show success message
    } catch (error) {
      console.error('Connection failed:', error);
      // Handle connection error
    } finally {
      setCurrentStep('success');
    }
  };

  const handleEthereumWalletToggle = (walletId: string, checked: boolean) => {
    setSelectedEthereumWallets(prev => (checked ? [...prev, walletId] : prev.filter(id => id !== walletId)));
  };

  const handleSolanaWalletToggle = (walletId: string, checked: boolean) => {
    setSelectedSolanaWallets(prev => (checked ? [...prev, walletId] : prev.filter(id => id !== walletId)));
  };

  const handleCosmosWalletToggle = (walletId: string, checked: boolean) => {
    setSelectedCosmosWallets(prev => (checked ? [...prev, walletId] : prev.filter(id => id !== walletId)));
  };

  const truncateString = (str: string, maxLength: number = 30): string => {
    if (str.length <= maxLength) return str;

    const ellipsis = '...';
    const ellipsisLength = ellipsis.length;
    const truncatedLength = maxLength - ellipsisLength;

    return str.slice(0, truncatedLength) + ellipsis;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'selection':
        return (
          <>
            {/* Wallet Selection Container */}
            <motion.div
              className="para:flex para:flex-col para:items-center para:justify-top para:py-8 para:px-8 para:gap-4 para:max-w-[500px] para:mx-auto para:bg-background"
              initial="hidden"
              animate={isMounted ? 'visible' : 'hidden'}
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.04,
                  },
                },
              }}
            >
              {/* Partner Logo */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="para:flex para:flex-col para:items-center para:justify-center para:border-1 para:border-border para:rounded-md para:overflow-clip para:h-16 para:w-16">
                        <img src="/mock-logos/acme-logo.png" alt="Spiral Logo" className="w-full h-full" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>www.acme.com</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </motion.div>

              {/* Wallet Selection Title and Description */}
              <motion.div
                className="para:flex para:flex-col para:items-center para:justify-center"
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <h1 className="para:text-2xl para:font-semibold para:text-center">Select wallets</h1>
                <p className="para:text-sm para:text-muted-foreground para:text-center">
                  These selections will be set as your default choice for this app.
                </p>
              </motion.div>

              {/* Wallet Selection Items */}
              <motion.div
                className="wallet-selection-items-wrapper para:flex para:flex-col para:items-start para:justify-center para:gap-10 para:w-full para:pb-20"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.04, // Delay between wallet groups
                    },
                  },
                }}
              >
                {/* Ethereum Wallet Selection Items */}
                <WalletGroup
                  title="Ethereum"
                  iconSrc="/ethereum-icon.svg"
                  iconAlt="Ethereum Logo"
                  iconClassName="bg-indigo-400 border-border"
                  wallets={[
                    {
                      id: 'wallet-1',
                      name: truncateString('An Extraordinarily Long Wallet Name', 24),
                      address: '0x123...abc',
                      balance: '$3,283.00',
                      logo: '/mock-logos/acme-logo.png',
                    },
                    {
                      id: 'wallet-2',
                      name: 'Beta Wallet',
                      address: '0x456...def',
                      balance: '$1,542.00',
                      logo: '/mock-logos/avalanche-logo.png',
                    },
                    {
                      id: 'wallet-3',
                      logo: '/mock-logos/ens-logo.png',
                      variant: 'create',
                    },
                  ]}
                  selectedWallets={selectedEthereumWallets}
                  onWalletToggle={handleEthereumWalletToggle}
                />

                {/* Solana Wallet Selection Items */}
                <WalletGroup
                  title="Solana"
                  iconSrc="/solana-icon.svg"
                  iconAlt="Solana Logo"
                  wallets={[
                    {
                      id: 'wallet-1',
                      name: 'Omega Wallet',
                      address: '0x123...abc',
                      balance: '$3,283.00',
                      logo: '/mock-logos/polygon-logo.png',
                    },
                    {
                      id: 'wallet-2',
                      name: 'Beta Wallet',
                      address: '0x456...def',
                      balance: '$1,542.00',
                      logo: '/mock-logos/acme-logo.png',
                    },
                    {
                      id: 'wallet-3',
                      logo: '/mock-logos/avalanche-logo.png',
                      variant: 'create',
                    },
                  ]}
                  selectedWallets={selectedSolanaWallets}
                  onWalletToggle={handleSolanaWalletToggle}
                />

                {/* Cosmos Wallet Selection Items */}
                <WalletGroup
                  title="Cosmos"
                  iconSrc="/cosmos-icon.svg"
                  iconAlt="Cosmos Logo"
                  wallets={[
                    {
                      id: 'wallet-1',
                      name: 'Omega Wallet',
                      address: '0x123...abc',
                      balance: '$3,283.00',
                      logo: '/mock-logos/ens-logo.png',
                    },
                    {
                      id: 'wallet-2',
                      name: 'Beta Wallet',
                      address: '0x456...def',
                      balance: '$1,542.00',
                      logo: '/mock-logos/polygon-logo.png',
                    },
                    {
                      id: 'wallet-3',
                      name: 'Gamma Wallet',
                      address: '0x456...def',
                      balance: '$1,542.00',
                      logo: '/mock-logos/acme-logo.png',
                    },
                    {
                      id: 'wallet-4',
                      logo: '/mock-logos/avalanche-logo.png',
                      variant: 'create',
                    },
                  ]}
                  selectedWallets={selectedCosmosWallets}
                  onWalletToggle={handleCosmosWalletToggle}
                />
              </motion.div>
            </motion.div>
          </>
        );

      case 'connecting':
        return (
          <div className="para:flex para:flex-col para:items-center para:justify-center para:py-16 para:px-8 para:gap-4">
            <div className="para:relative para:w-12 para:h-12">
              <Spinner />
            </div>
            <WalletItem
              id="wallet-1"
              logo="/mock-logos/acme-logo.png"
              name="An Extraordinarily Long Wall..."
              address="0x123...abc"
              balance="$3,283.00"
            />
            <h2 className="para:text-xl para:font-semibold">Connecting your wallets...</h2>
          </div>
        );

      case 'success':
        return (
          <div className="para:flex para:flex-col para:items-center para:justify-center para:py-16 para:px-8 para:gap-4">
            <h2 className="para:text-xl para:font-semibold">Wallets Connected!</h2>
            <Button onClick={() => window.close()}>Close</Button>
          </div>
        );

      case 'error':
        return (
          <div className="para:flex para:flex-col para:items-center para:justify-center para:py-16 para:px-8 para:gap-4">
            <h2 className="para:text-xl para:font-semibold">Connection Failed</h2>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      {renderStepContent()}
      {currentStep === 'selection' && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0, y: 10 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="para:fixed para:bottom-0 para:left-0 para:right-0 para:p-4 para:border-t para:border-border para:bg-background para:z-10"
        >
          <div>
            <Button size="lg" className="para:w-full para:cursor-pointer" disabled={isDisabled} onClick={handleConnect}>
              {buttonText}
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
