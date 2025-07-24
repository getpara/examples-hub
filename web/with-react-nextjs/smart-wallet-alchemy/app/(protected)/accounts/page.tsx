"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, ListChecks, LogIn, Wallet, CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";
import { useModal, useWallet, useAccount } from "@getpara/react-sdk";
import { useSmartWallets } from "@/hooks/use-smart-wallets";
import { useNextAvailableWalletIndex } from "@/hooks/use-next-available-wallet-index";
import { useBalance, weiToUsd } from "@/hooks/useBalance";
import { useEthPrice } from "@/hooks/useEthPrice";
import { formatEther } from "viem";
import { MAX_SMART_WALLETS_PER_EOA, WALLET_LIMIT_MESSAGE } from "@/constants/smart-wallet";

// Component to display wallet balance
function WalletBalance({ address }: { address: string }) {
  const { balance, isLoading, isError } = useBalance(address);
  const { priceUsd, isLoading: isPriceLoading } = useEthPrice();

  if (isLoading || isPriceLoading) {
    return <span className="text-sm text-muted-foreground">Loading...</span>;
  }

  if (isError) {
    return <span className="text-sm text-muted-foreground">--</span>;
  }

  if (!balance) {
    return <span className="text-sm text-muted-foreground">--</span>;
  }

  const ethBalance = formatEther(balance.wei);
  const ethDisplay = Number(ethBalance).toFixed(4);
  const usdValue = priceUsd ? weiToUsd(balance.wei, priceUsd) : null;

  return (
    <div className="text-right">
      <p className="font-medium">{ethDisplay} ETH</p>
      {usdValue && <p className="text-sm text-muted-foreground">${usdValue}</p>}
    </div>
  );
}

export default function AccountsPage() {
  const router = useRouter();
  const { openModal } = useModal();
  const { data: wallet } = useWallet();
  const { isConnected, isLoading: isAccountLoading } = useAccount();
  const {
    data: smartWallets,
    isLoading: isWalletsLoading,
    isError: isWalletsError,
    error: walletsError,
  } = useSmartWallets();
  const nextAvailableIndex = useNextAvailableWalletIndex();

  const handleNavigateToCreate = () => {
    router.push("/create-smart-wallet");
  };

  const handleNavigateToWallet = (address: string) => {
    router.push(`/accounts/${address}`);
  };

  if (!isConnected && !isAccountLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex-1 flex flex-col items-center justify-center z-0">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-2xl">Connect Your Wallet</CardTitle>
            <CardDescription>Please connect your EOA wallet to view or create smart wallets.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => openModal()}
              size="lg"
              data-testid="accounts-connect-wallet-button">
              <LogIn className="mr-2 h-5 w-5" />
              Connect EOA Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 flex-1 flex flex-col items-center z-0">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">Your Smart Wallets</CardTitle>
              <CardDescription>
                Manage your smart contract accounts owned by{" "}
                {wallet?.address
                  ? `${wallet.address.substring(0, 6)}...${wallet.address.substring(wallet.address.length - 4)}`
                  : "your EOA"}
                .
              </CardDescription>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={handleNavigateToCreate}
                    size="sm"
                    disabled={
                      isWalletsLoading ||
                      isWalletsError ||
                      nextAvailableIndex === null ||
                      nextAvailableIndex === undefined
                    }
                    data-testid="accounts-create-account-button">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Account
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isWalletsLoading && "Loading wallet information..."}
                  {isWalletsError && "Unable to load wallet information"}
                  {nextAvailableIndex === null && (
                    <div className="space-y-1">
                      <p>Wallet limit reached ({MAX_SMART_WALLETS_PER_EOA} max)</p>
                      <p className="text-xs text-muted-foreground">{WALLET_LIMIT_MESSAGE}</p>
                    </div>
                  )}
                  {nextAvailableIndex === undefined &&
                    !isWalletsLoading &&
                    !isWalletsError &&
                    "Checking wallet status..."}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent>
          {isAccountLoading || isWalletsLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
              <p className="text-muted-foreground">Loading wallet information...</p>
            </div>
          ) : isWalletsError ? (
            <div className="flex flex-col justify-center items-center h-40 text-center">
              <AlertCircle className="h-8 w-8 text-destructive mb-2" />
              <p className="text-destructive font-medium">Failed to load wallets</p>
              <pre className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap break-words max-h-60 overflow-auto">
                {walletsError instanceof Error ? walletsError.message : "Please try refreshing the page"}
              </pre>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                size="sm"
                className="mt-4"
                data-testid="accounts-error-retry-button">
                Try Again
              </Button>
            </div>
          ) : smartWallets && smartWallets.length > 0 ? (
            <div className="space-y-3">
              {smartWallets.map((smartWallet, index) => (
                <Card
                  key={smartWallet.index}
                  className={smartWallet.isDeployed ? "cursor-pointer hover:bg-muted/50 transition-colors" : ""}
                  onClick={() => smartWallet.isDeployed && handleNavigateToWallet(smartWallet.address)}
                  data-testid={`accounts-wallet-card-${index}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Wallet className="h-10 w-10 text-primary" />
                        <div>
                          <p className="font-semibold">Smart Wallet #{smartWallet.index + 1}</p>
                          <p className="text-sm text-muted-foreground font-mono">
                            {smartWallet.address.substring(0, 6)}...
                            {smartWallet.address.substring(smartWallet.address.length - 4)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        {smartWallet.isDeployed && <WalletBalance address={smartWallet.address} />}
                        <div className="flex items-center space-x-2">
                          {smartWallet.isDeployed ? (
                            <>
                              <CheckCircle className="h-5 w-5 text-green-500" />
                              <span className="text-sm text-green-600">Deployed</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-5 w-5 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">Not Deployed</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {nextAvailableIndex !== null && nextAvailableIndex !== undefined && (
                <div className="text-center pt-4">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={handleNavigateToCreate}
                          variant="outline"
                          className="w-full"
                          disabled={isWalletsError}
                          data-testid="accounts-create-wallet-cta-button">
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Create Smart Wallet #{nextAvailableIndex + 1}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="space-y-1">
                          <p>Create wallet {nextAvailableIndex + 1} of {MAX_SMART_WALLETS_PER_EOA}</p>
                          <p className="text-xs text-muted-foreground">{WALLET_LIMIT_MESSAGE}</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-10 border-2 border-dashed border-muted rounded-lg">
              <ListChecks className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Smart Wallets Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first smart wallet to get started with gasless transactions.
              </p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={handleNavigateToCreate}
                      disabled={isWalletsError || nextAvailableIndex === null || nextAvailableIndex === undefined}
                      data-testid="accounts-create-first-wallet-button">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create Your First Smart Wallet
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {(nextAvailableIndex === null || nextAvailableIndex === undefined) ? (
                      <div className="space-y-1">
                        <p>Unable to create wallet</p>
                        <p className="text-xs text-muted-foreground">
                          {isWalletsError ? "Error loading wallet information" : WALLET_LIMIT_MESSAGE}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p>Create your first smart wallet</p>
                        <p className="text-xs text-muted-foreground">{WALLET_LIMIT_MESSAGE}</p>
                      </div>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
