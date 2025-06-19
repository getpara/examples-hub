"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, CheckCircle, Loader2, AlertTriangle, PartyPopper, Copy, Ban } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from "@getpara/react-sdk";
import { useSmartWalletAddress } from "@/hooks/use-smart-wallet-address";
import { useDeploySmartWallet } from "@/hooks/use-deploy-smart-wallet";
import { useNextAvailableWalletIndex } from "@/hooks/use-next-available-wallet-index";
import { useSmartWallets } from "@/hooks/use-smart-wallets";
import { useDeploymentFee } from "@/hooks/useDeploymentFee";
import { useEthPrice } from "@/hooks/useEthPrice";

type SmartWallet = {
  id: string;
  name: string;
  address: string;
  network: string;
  balance: string;
  createdAt: string;
};

type DeploymentState = "idle" | "deploying" | "success" | "error";

const supportedNetworks = [
  {
    id: "sepolia",
    name: "Sepolia (Testnet)",
    logoUrl: "/placeholder.svg?width=24&height=24",
    symbol: "ETH",
  },
];

export default function CreateAccountPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { data: wallet } = useWallet();
  const [walletName, setWalletName] = useState("");
  const [selectedNetworkId, setSelectedNetworkId] = useState<string>(supportedNetworks[0].id);
  const [deploymentState, setDeploymentState] = useState<DeploymentState>("idle");
  const [newlyCreatedWallet, setNewlyCreatedWallet] = useState<SmartWallet | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const nextIndex = useNextAvailableWalletIndex();
  const { isError: isWalletsError, error: walletsError } = useSmartWallets();

  const { data: predictedAddress, isLoading: isAddressLoading } = useSmartWalletAddress(nextIndex ?? 0);

  const { mutate: deployWallet, isPending: isDeploying } = useDeploySmartWallet();

  const { priceUsd: ethPriceUsd } = useEthPrice();
  const { data: deploymentFee, isLoading: isFeeLoading } = useDeploymentFee(wallet?.id || null, nextIndex ?? 0);

  const currentNetworkDetails = useMemo(() => {
    return supportedNetworks.find((n) => n.id === selectedNetworkId);
  }, [selectedNetworkId]);

  const estimatedFeeDisplay = useMemo(() => {
    if (!currentNetworkDetails) return "N/A";

    if (isFeeLoading) return "Calculating...";

    if (deploymentFee?.isSponsored) {
      return "Sponsored (Free)";
    }

    const ethAmount = deploymentFee?.ethAmount || "0";
    const usdAmount = deploymentFee?.usdAmount || "0.00";

    return `${ethAmount} ${currentNetworkDetails.symbol} (~$${usdAmount} USD)`;
  }, [currentNetworkDetails, deploymentFee, isFeeLoading]);

  const handleDeploy = async () => {
    if (!walletName.trim()) {
      toast({ title: "Validation Error", description: "Wallet name cannot be empty.", variant: "destructive" });
      return;
    }
    if (!wallet?.address || !currentNetworkDetails || nextIndex === null || nextIndex === undefined) {
      toast({ title: "Error", description: "Required information missing.", variant: "destructive" });
      return;
    }

    deployWallet(
      { index: nextIndex, name: walletName },
      {
        onSuccess: (result) => {
          const newWallet: SmartWallet = {
            id: String(Date.now()),
            name: walletName,
            address: result.address,
            network: currentNetworkDetails.name,
            balance: "0.00 ETH",
            createdAt: new Date().toISOString(),
          };
          setNewlyCreatedWallet(newWallet);
          setDeploymentState("success");
          toast({
            title: "Deployment Successful!",
            description: `Smart wallet "${newWallet.name}" created on ${newWallet.network}.`,
          });
        },
        onError: (error) => {
          const errorMsg = error instanceof Error ? error.message : "Failed to deploy smart wallet";
          setErrorMessage(errorMsg);
          setDeploymentState("error");
          toast({
            title: "Deployment Failed",
            description: errorMsg,
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleContinue = () => router.push("/accounts");
  const handleTryAgain = () => {
    setDeploymentState("idle");
    setErrorMessage(null);
  };

  const handleCopyAddress = (address: string) => {
    navigator.clipboard
      .writeText(address)
      .then(() => {
        toast({
          title: "Address Copied!",
          description: `${address} copied to clipboard.`,
        });
      })
      .catch((err) => {
        console.error("Failed to copy address: ", err);
        toast({
          title: "Copy Failed",
          description: "Could not copy address to clipboard.",
          variant: "destructive",
        });
      });
  };

  if (deploymentState === "success" && newlyCreatedWallet) {
    return (
      <div className="container mx-auto py-8 px-4 flex-1 flex flex-col items-center justify-center z-0">
        <Card className="w-full max-w-lg max-h-[85vh] overflow-auto text-center">
          <CardHeader className="pt-8">
            <PartyPopper className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <CardTitle className="text-2xl">Smart Wallet Created!</CardTitle>
            <CardDescription>Your new smart wallet is ready to use.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 py-6">
            <div className="text-left">
              <Label
                htmlFor="finalWalletName"
                className="text-muted-foreground">
                Wallet Name
              </Label>
              <p
                id="finalWalletName"
                className="font-semibold text-lg truncate"
                title={newlyCreatedWallet.name}>
                {newlyCreatedWallet.name}
              </p>
            </div>
            <div className="text-left">
              <Label
                htmlFor="finalWalletAddress"
                className="text-muted-foreground">
                Smart Wallet Address
              </Label>
              <div
                className="group flex items-center justify-between font-mono text-sm break-all p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                onClick={() => handleCopyAddress(newlyCreatedWallet.address)}
                title="Click to copy address"
                data-testid="create-success-copy-address">
                <span>{newlyCreatedWallet.address}</span>
                <Copy className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            <div className="text-left">
              <Label
                htmlFor="finalWalletNetwork"
                className="text-muted-foreground">
                Network
              </Label>
              <div className="flex items-center">
                {currentNetworkDetails?.logoUrl && (
                  <Image
                    src={currentNetworkDetails.logoUrl || "/placeholder.svg"}
                    alt={`${currentNetworkDetails.name} logo`}
                    width={20}
                    height={20}
                    className="mr-2 rounded-full object-contain"
                  />
                )}
                <p id="finalWalletNetwork">{newlyCreatedWallet.network}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              onClick={handleContinue}
              className="w-full"
              size="lg"
              data-testid="create-success-continue-button">
              Let&apos;s Go!
              <CheckCircle className="ml-2 h-5 w-5" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (deploymentState === "error") {
    return (
      <div className="container mx-auto py-8 px-4 flex-1 flex flex-col items-center justify-center z-0">
        <Card className="w-full max-w-lg max-h-[85vh] overflow-auto text-center">
          <CardHeader className="pt-8">
            <AlertTriangle className="mx-auto h-16 w-16 text-destructive mb-4" />
            <CardTitle className="text-2xl">Deployment Failed</CardTitle>
            <CardDescription className="text-destructive">
              <pre className="whitespace-pre-wrap break-words max-h-60 overflow-auto">
                {errorMessage || "An unexpected error occurred."}
              </pre>
            </CardDescription>
          </CardHeader>
          <CardContent className="py-6">
            <p className="text-muted-foreground">
              Something went wrong during the smart wallet deployment. Please check the details and try again.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={() => router.push("/accounts")}
              variant="outline"
              className="w-full sm:w-auto"
              data-testid="create-error-back-button">
              Back to Accounts
            </Button>
            <Button
              variant="outline"
              onClick={handleTryAgain}
              className="w-full sm:w-auto"
              data-testid="create-error-retry-button">
              Try Again
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (nextIndex === null) {
    return (
      <div className="container mx-auto py-8 px-4 flex-1 flex flex-col items-center justify-center z-0">
        <Card className="w-full max-w-lg max-h-[85vh] overflow-auto text-center">
          <CardHeader className="pt-8">
            <Ban className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <CardTitle className="text-2xl">Wallet Limit Reached</CardTitle>
            <CardDescription>
              You have reached the maximum of 3 smart wallets. To create a new one, you'll need to use a different EOA.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              onClick={() => router.push("/accounts")}
              variant="outline"
              className="w-full"
              data-testid="create-limit-back-button">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Accounts
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (isWalletsError) {
    return (
      <div className="container mx-auto py-8 px-4 flex-1 flex flex-col items-center justify-center z-0">
        <Card className="w-full max-w-lg max-h-[85vh] overflow-auto text-center">
          <CardHeader className="pt-8">
            <AlertTriangle className="mx-auto h-16 w-16 text-destructive mb-4" />
            <CardTitle className="text-2xl">Unable to Load Wallets</CardTitle>
            <CardDescription className="text-destructive">
              <pre className="whitespace-pre-wrap break-words max-h-60 overflow-auto">
                {walletsError instanceof Error ? walletsError.message : "Failed to check existing wallets"}
              </pre>
            </CardDescription>
          </CardHeader>
          <CardContent className="py-6">
            <p className="text-muted-foreground">
              We couldn't verify your existing wallets. Please try again or contact support if the issue persists.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={() => router.push("/accounts")}
              variant="outline"
              className="w-full sm:w-auto"
              data-testid="create-wallets-error-back-button">
              Back to Accounts
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="w-full sm:w-auto"
              data-testid="create-wallets-error-retry-button">
              Try Again
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (nextIndex === undefined) {
    return (
      <div className="container mx-auto py-8 px-4 flex-1 flex flex-col items-center justify-center z-0">
        <Card className="w-full max-w-lg max-h-[85vh] overflow-auto text-center">
          <CardHeader className="pt-8">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
            <CardTitle className="text-2xl">Checking Wallet Status</CardTitle>
            <CardDescription>Please wait while we verify your existing wallets...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 flex-1 flex flex-col items-center justify-center z-0">
      <Card className="w-full max-w-lg max-h-[85vh] overflow-auto">
        <CardHeader>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="absolute top-4 left-4 sm:top-6 sm:left-6"
            data-testid="create-back-button">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <CardTitle className="text-2xl pt-8 sm:pt-0 text-center sm:text-left">Create New Smart Wallet</CardTitle>
          <CardDescription className="text-center sm:text-left">
            Set up your new smart contract wallet. It will be owned by your connected EOA.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 py-6">
          <div className="space-y-2">
            <Label htmlFor="walletName">Smart Wallet Name</Label>
            <Input
              id="walletName"
              placeholder="e.g., My DeFi Vault"
              value={walletName}
              onChange={(e) => setWalletName(e.target.value)}
              disabled={deploymentState === "deploying"}
              data-testid="create-wallet-name-input"
            />
          </div>
          <div className="space-y-2">
            <Label>Owner EOA (1-of-1 Signer)</Label>
            <Input
              value={wallet?.address || "Connecting..."}
              readOnly
              disabled
              className="font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="network">Network</Label>
            <Select
              value={selectedNetworkId}
              onValueChange={setSelectedNetworkId}
              disabled={deploymentState === "deploying" || supportedNetworks.length <= 1}>
              <SelectTrigger
                id="network"
                data-testid="create-network-select">
                <SelectValue placeholder="Select network">
                  {currentNetworkDetails && (
                    <div className="flex items-center">
                      <Image
                        src={currentNetworkDetails.logoUrl || "/placeholder.svg"}
                        alt={`${currentNetworkDetails.name} logo`}
                        width={20}
                        height={20}
                        className="mr-2 rounded-full object-contain"
                      />
                      {currentNetworkDetails.name}
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {supportedNetworks.map((network) => (
                  <SelectItem
                    key={network.id}
                    value={network.id}>
                    <div className="flex items-center">
                      <Image
                        src={network.logoUrl || "/placeholder.svg"}
                        alt={`${network.name} logo`}
                        width={20}
                        height={20}
                        className="mr-2 rounded-full object-contain"
                      />
                      {network.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-3 p-4 bg-muted/50 rounded-md border border-dashed">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Est. Deployment Fee:</span>
              <span className="font-medium">{estimatedFeeDisplay}</span>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground text-sm">Anticipated Smart Wallet Address:</span>
              {isAddressLoading ? (
                <div className="flex items-center">
                  <Loader2 className="h-3 w-3 animate-spin mr-2" />
                  <span className="text-xs">Calculating address...</span>
                </div>
              ) : (
                <p className="font-mono text-xs break-all">{predictedAddress || "Address will be generated"}</p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleDeploy}
            disabled={isDeploying || !walletName.trim() || !predictedAddress}
            className="w-full"
            size="lg"
            data-testid="create-deploy-button">
            {isDeploying ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Deploying...
              </>
            ) : (
              "Confirm & Deploy"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
