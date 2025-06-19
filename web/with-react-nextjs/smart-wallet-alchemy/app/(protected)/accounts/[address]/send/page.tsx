"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useClient, useWallet, useAccount } from "@getpara/react-sdk";
import { useBalance } from "@/hooks/useBalance";
import { useEthPrice } from "@/hooks/useEthPrice";
import { createParaAlchemyClient, generateSalt } from "@/lib/smart-wallet/core";
import { parseEther, isAddress } from "viem";

export default function SendAssetsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const para = useClient();
  const { data: wallet } = useWallet();
  const { data: account } = useAccount();

  const walletAddress = params.address as string;
  const { balance, isLoading: isBalanceLoading } = useBalance(walletAddress);
  const { priceUsd } = useEthPrice();

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [token] = useState("ETH");
  const [isSending, setIsSending] = useState(false);

  const ethBalance = parseFloat(balance?.ether || "0");
  const usdValue = priceUsd && amount ? (parseFloat(amount) * priceUsd).toFixed(2) : null;

  const validateForm = () => {
    if (!recipient || !amount) {
      toast({ title: "Validation Error", description: "Please fill in all fields", variant: "destructive" });
      return false;
    }

    if (!isAddress(recipient)) {
      toast({ title: "Invalid Address", description: "Please enter a valid Ethereum address", variant: "destructive" });
      return false;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({ title: "Invalid Amount", description: "Please enter a valid amount", variant: "destructive" });
      return false;
    }

    if (amountNum > ethBalance) {
      toast({ title: "Insufficient Balance", description: "Amount exceeds available balance", variant: "destructive" });
      return false;
    }

    return true;
  };

  const handleSend = async () => {
    if (!validateForm()) return;
    if (!para || !wallet?.id || !account?.isConnected) {
      toast({ title: "Error", description: "Wallet not connected", variant: "destructive" });
      return;
    }

    setIsSending(true);
    try {
      const walletIndex = 0;
      const salt = generateSalt(wallet.id, walletIndex);
      const client = await createParaAlchemyClient(para, salt);

      const result = await client.sendUserOperation({
        uo: {
          target: recipient as `0x${string}`,
          data: "0x",
          value: parseEther(amount),
        },
      });

      const txHash = await client.waitForUserOperationTransaction(result);

      toast({
        title: "Transaction Sent!",
        description: `Transaction hash: ${txHash.slice(0, 10)}...${txHash.slice(-8)}`,
      });

      router.push(`/accounts/${walletAddress}`);
    } catch (error) {
      console.error("Send transaction error:", error);
      toast({
        title: "Transaction Failed",
        description: error instanceof Error ? error.message : "Failed to send transaction",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 flex-1 flex flex-col items-center justify-center z-0">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="absolute top-4 left-4 sm:top-6 sm:left-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <CardTitle className="text-2xl pt-8 sm:pt-0 text-center sm:text-left">Send Assets</CardTitle>
          <CardDescription className="text-center sm:text-left">
            Send ETH from your smart wallet to another address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 py-6">
          <div className="space-y-2">
            <Label htmlFor="token">Token</Label>
            <Select
              value={token}
              disabled>
              <SelectTrigger id="token">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ETH">ETH (Ethereum)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="amount">Amount</Label>
              <span className="text-sm text-muted-foreground">
                Balance: {isBalanceLoading ? "..." : `${ethBalance.toFixed(4)} ETH`}
              </span>
            </div>
            <Input
              id="amount"
              type="number"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.0001"
              min="0"
            />
            {usdValue && <p className="text-sm text-muted-foreground">≈ ${usdValue} USD</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Address</Label>
            <Input
              id="recipient"
              placeholder="0x..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="font-mono"
            />
          </div>

          <div className="space-y-3 p-4 bg-muted/50 rounded-md border border-dashed">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Network:</span>
              <span className="font-medium">Sepolia (Testnet)</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Gas Fee:</span>
              <span className="font-medium">Sponsored (Free)</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleSend}
            disabled={isSending || !recipient || !amount || isBalanceLoading}
            className="w-full"
            size="lg">
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-5 w-5" />
                Send {amount || "0"} ETH
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
