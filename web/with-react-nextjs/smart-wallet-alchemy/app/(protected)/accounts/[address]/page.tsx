"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useWallet, useAccount } from "@getpara/react-sdk";
import { useBalance } from "@/hooks/useBalance";
import { useEthPrice } from "@/hooks/useEthPrice";

type SmartWallet = {
  id: string;
  name: string;
  address: string;
  network: string;
  balance: string;
  createdAt: string;
};
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Copy,
  Send,
  ArrowDownToLine,
  ListCollapse,
  ExternalLink,
  Loader2,
  AlertTriangle,
  MoreHorizontal,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import { isAddress } from "viem";

// Mock transaction data
interface MockTransaction {
  id: string;
  type: "Sent" | "Received" | "Contract Interaction";
  amount?: string;
  token?: string;
  toFrom: string;
  date: string;
  status: "Confirmed" | "Pending";
}

const mockTransactions: MockTransaction[] = [
  {
    id: "1",
    type: "Received",
    amount: "0.5",
    token: "ETH",
    toFrom: "0xSenderAddress...",
    date: "2024-06-17",
    status: "Confirmed",
  },
  {
    id: "2",
    type: "Sent",
    amount: "100",
    token: "USDC",
    toFrom: "0xReceiverAddress...",
    date: "2024-06-16",
    status: "Confirmed",
  },
  {
    id: "3",
    type: "Contract Interaction",
    toFrom: "Uniswap Router",
    date: "2024-06-15",
    status: "Confirmed",
  },
  {
    id: "4",
    type: "Received",
    amount: "0.01",
    token: "ETH",
    toFrom: "0xAnotherSender...",
    date: "2024-06-14",
    status: "Pending",
  },
];

const networkLogos: { [key: string]: string } = {
  "Sepolia (Testnet)": "/placeholder.svg?width=20&height=20",
  "Ethereum Mainnet": "/placeholder.svg?width=20&height=20",
  "Polygon Mainnet": "/placeholder.svg?width=20&height=20",
};

export default function SmartWalletAccountPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const {} = useWallet(); // Para wallet data available but not used in this view
  const { data: account } = useAccount();
  const [wallet, setWallet] = useState<SmartWallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReceiveDialogOpen, setIsReceiveDialogOpen] = useState(false);

  const walletAddress = params.address as string;
  const { balance, isLoading: isBalanceLoading, isError: isBalanceError } = useBalance(walletAddress);
  const { priceUsd, isLoading: isPriceLoading, isError: isPriceError } = useEthPrice();

  useEffect(() => {
    // Validate address format
    if (!isAddress(walletAddress)) {
      toast({
        title: "Invalid Address",
        description: "The wallet address is not valid.",
        variant: "destructive",
      });
      router.replace("/accounts");
      return;
    }

    if (!account?.isConnected) {
      // Redirect if EOA is not connected, as smart wallets are tied to it
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first.",
        variant: "destructive",
      });
      router.replace("/accounts");
      return;
    }

    // For now, create a mock wallet for the address
    // In a real implementation, this would fetch from Para's API
    if (walletAddress) {
      const mockWallet: SmartWallet = {
        id: walletAddress,
        name: "Smart Wallet",
        address: walletAddress,
        network: "Sepolia (Testnet)",
        balance: "0.00 ETH",
        createdAt: new Date().toISOString(),
      };
      setWallet(mockWallet);
      setIsLoading(false);
    }
  }, [walletAddress, account, router, toast]);

  // Calculate USD value
  const usdValue = useMemo(() => {
    if (!balance || !priceUsd) return null;
    const ethAmount = parseFloat(balance.ether);
    return (ethAmount * priceUsd).toFixed(2);
  }, [balance, priceUsd]);

  const handleCopyAddress = () => {
    if (!wallet) return;
    navigator.clipboard.writeText(wallet.address).then(() => {
      toast({ title: "Address Copied!", description: `${wallet.address} copied to clipboard.` });
    });
  };

  const handleSend = () => {
    router.push(`/accounts/${walletAddress}/send`);
  };

  const handleReceive = () => {
    setIsReceiveDialogOpen(true);
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById("wallet-qr-code");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new window.Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");

      const downloadLink = document.createElement("a");
      downloadLink.download = `wallet-${walletAddress.slice(0, 8)}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex-1 flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading wallet details...</p>
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="container mx-auto py-8 px-4 flex-1 flex flex-col items-center justify-center text-center">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Smart Wallet Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The smart wallet with address <code className="font-mono bg-muted p-1 rounded">{walletAddress}</code> could
          not be found or you may not have access.
        </p>
        <Button
          variant="outline"
          onClick={() => router.push("/accounts")}
          data-testid="account-error-back-button">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Accounts
        </Button>
      </div>
    );
  }

  const networkLogo = networkLogos[wallet.network] || "/placeholder.svg?width=20&height=20";

  return (
    <div className="container mx-auto py-8 px-4 flex-1 flex flex-col items-center z-0">
      <div className="w-full max-w-3xl space-y-6">
        <Button
          variant="outline"
          onClick={() => router.push("/accounts")}
          className="self-start mb-4"
          data-testid="account-back-button">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Accounts
        </Button>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle
                  className="text-2xl font-bold truncate"
                  title={wallet.name}>
                  {wallet.name}
                </CardTitle>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <Image
                    src={networkLogo || "/placeholder.svg"}
                    alt={`${wallet.network} logo`}
                    width={16}
                    height={16}
                    className="mr-1.5 rounded-full object-contain"
                  />
                  {wallet.network}
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    data-testid="account-more-options-button">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={handleCopyAddress}
                    data-testid="account-copy-address-menu-item">
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Address
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => window.open(`https://sepolia.etherscan.io/address/${wallet.address}`, "_blank")}
                    data-testid="account-view-etherscan-menu-item">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View on Etherscan
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="font-mono text-xs text-muted-foreground break-all pt-1">{wallet.address}</div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">Total Balance</div>
            {isBalanceLoading || isPriceLoading ? (
              <div className="flex items-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                <span className="text-muted-foreground">Loading balance...</span>
              </div>
            ) : isBalanceError || isPriceError ? (
              <div className="text-muted-foreground">Unable to load balance</div>
            ) : (
              <>
                <div className="text-4xl font-bold">
                  {balance ? parseFloat(balance.ether).toFixed(4) : "0.0000"}{" "}
                  <span className="text-2xl text-muted-foreground">ETH</span>
                </div>
                {usdValue && <div className="text-sm text-muted-foreground">≈ ${usdValue} USD</div>}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={handleSend}
              className="w-full">
              <Send className="mr-2 h-5 w-5" /> Send Assets
            </Button>
            <Button
              size="lg"
              onClick={handleReceive}
              variant="outline"
              className="w-full">
              <ArrowDownToLine className="mr-2 h-5 w-5" /> Receive Assets
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Transaction History (Mock)</CardTitle>
            <CardDescription>Recent activity for this smart wallet.</CardDescription>
          </CardHeader>
          <CardContent>
            {mockTransactions.length > 0 ? (
              <ul className="space-y-4">
                {mockTransactions.map((tx) => (
                  <li
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-md hover:bg-muted/50">
                    <div className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                          tx.type === "Received"
                            ? "bg-green-100 dark:bg-green-900"
                            : tx.type === "Sent"
                            ? "bg-red-100 dark:bg-red-900"
                            : "bg-blue-100 dark:bg-blue-900"
                        }`}>
                        {tx.type === "Received" ? (
                          <ArrowDownToLine className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ) : tx.type === "Sent" ? (
                          <Send className="h-4 w-4 text-red-600 dark:text-red-400 -rotate-45" />
                        ) : (
                          <ListCollapse className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {tx.type}{" "}
                          {tx.amount && tx.token && (
                            <span className="text-sm">
                              {tx.amount} {tx.token}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {tx.type === "Contract Interaction" ? "To: " : tx.type === "Sent" ? "To: " : "From: "}
                          <span className="font-mono break-all">
                            {tx.toFrom.length > 20
                              ? `${tx.toFrom.substring(0, 10)}...${tx.toFrom.substring(tx.toFrom.length - 6)}`
                              : tx.toFrom}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{tx.date}</p>
                      <p
                        className={`text-xs ${
                          tx.status === "Confirmed"
                            ? "text-green-600 dark:text-green-400"
                            : "text-yellow-600 dark:text-yellow-400"
                        }`}>
                        {tx.status}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-muted-foreground py-6">No transactions yet.</p>
            )}
          </CardContent>
          {mockTransactions.length > 0 && (
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                data-testid="account-view-transactions-button">
                View All Transactions
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>

      {/* Receive Assets Dialog */}
      <Dialog
        open={isReceiveDialogOpen}
        onOpenChange={setIsReceiveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Receive Assets</DialogTitle>
            <DialogDescription>Share your wallet address or QR code to receive assets</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-white p-4 rounded-lg">
              <QRCodeSVG
                id="wallet-qr-code"
                value={walletAddress}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>
            <div className="w-full space-y-2">
              <Label className="text-sm text-muted-foreground">Wallet Address</Label>
              <div className="flex items-center space-x-2">
                <Input
                  value={walletAddress}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleCopyAddress}
                  data-testid="account-dialog-copy-button">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex space-x-2 w-full">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleDownloadQR}
                data-testid="account-download-qr-button">
                <ArrowDownToLine className="mr-2 h-4 w-4" />
                Download QR
              </Button>
              <Button
                variant="default"
                className="flex-1"
                onClick={() => setIsReceiveDialogOpen(false)}
                data-testid="account-dialog-done-button">
                Done
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
