"use client";

import type React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Copy, ArrowRightCircle } from "lucide-react"; // Added ArrowRightCircle
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation"; // Import useRouter
type SmartWallet = {
  id: string;
  name: string;
  contractAddress: string;
  network: string;
  balance: string;
  createdAt: string;
};

interface SmartWalletCardItemProps {
  wallet: SmartWallet;
}

export default function SmartWalletCardItem({ wallet }: SmartWalletCardItemProps) {
  const { toast } = useToast();
  const router = useRouter(); // Initialize router

  const handleCopyAddress = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when copying
    navigator.clipboard
      .writeText(wallet.contractAddress)
      .then(() => {
        toast({
          title: "Address Copied!",
          description: `${wallet.contractAddress} copied to clipboard.`,
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

  const handleCardClick = () => {
    router.push(`/accounts/${wallet.contractAddress}`);
  };

  return (
    <Card
      className="overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer group"
      onClick={handleCardClick}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30 p-4">
        <div className="flex items-center">
          <Wallet className="h-5 w-5 text-muted-foreground mr-3" />
          <CardTitle
            className="text-lg font-medium truncate"
            title={wallet.name}>
            {wallet.name}
          </CardTitle>
        </div>
        <ArrowRightCircle className="h-5 w-5 text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:text-primary transition-all" />
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="text-xs text-muted-foreground mb-1">Network: {wallet.network}</div>
        <div className="text-sm text-muted-foreground">Contract Address:</div>
        <div className="flex items-center justify-between">
          <p className="font-mono text-sm break-all pr-2">{wallet.contractAddress}</p>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopyAddress}
            aria-label="Copy address"
            className="hover:bg-primary/10">
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
