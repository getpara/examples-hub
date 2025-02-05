import React, { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { Button } from "../ui/button";
import { Check, Wallet, X, Zap } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { ParaEthersSigner } from "@getpara/ethers-v6-integration";
import para from "../../lib/para";
import { LoadingState } from "../ui/loading-state";
import _ from "lodash";

interface TransactionScreenProps {
  setScreen: (screen: ScreenName) => void;
}

const TransactionScreen: React.FC<TransactionScreenProps> = ({ setScreen }) => {
  const [value, setValue] = useState("");
  const [gas, setGas] = useState("21000");
  const [estimatedFee, setEstimatedFee] = useState<string>("");
  const [signedMessage, setSignedMessage] = useState("");
  const [isTransactionSigned, setIsTransactionSigned] = useState(false);
  const [error, setError] = useState("");
  const [address, setAddress] = useState("");
  const [isSigning, setIsSigning] = useState(false);

  const estimateGasAndFee = useCallback(async () => {
    if (!value || !address) return;

    try {
      const provider = new ethers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");
      const baseGas = 21000n;
      const gasWithBuffer = (baseGas * 120n) / 100n; // 20% buffer
      setGas(gasWithBuffer.toString());

      const feeData = await provider.getFeeData();

      if (feeData.gasPrice) {
        const estimatedFeeWei = gasWithBuffer * feeData.gasPrice;
        const estimatedFeeEth = ethers.formatEther(estimatedFeeWei);
        setEstimatedFee(estimatedFeeEth);
      }
    } catch (error) {
      setGas("21000");
      setEstimatedFee("");
    }
  }, [value, address]);

  const debouncedEstimateGasAndFee = useCallback(
    _.debounce(() => {
      estimateGasAndFee();
    }, 500),
    [estimateGasAndFee]
  );

  useEffect(() => {
    const provider = new ethers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");
    const signer = new ParaEthersSigner(para, provider);

    const fetchAddress = async () => {
      try {
        const address = await signer.getAddress();
        if (!address) {
          setError("Failed to fetch address");
          return;
        }
        setAddress(address);
      } catch (error) {
        setError("Failed to fetch address");
      }
    };

    fetchAddress();
  }, []);

  useEffect(() => {
    if (address) {
      estimateGasAndFee();
    }

    return () => {
      debouncedEstimateGasAndFee.cancel();
    };
  }, [address]);

  useEffect(() => {
    if (value && address) {
      debouncedEstimateGasAndFee();
    }

    return () => {
      debouncedEstimateGasAndFee.cancel();
    };
  }, [value, address, debouncedEstimateGasAndFee]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSigning(true);

    try {
      const provider = new ethers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");
      const signer = new ParaEthersSigner(para, provider);

      const transaction = {
        from: address,
        to: address,
        value: ethers.parseUnits(value || "0", "ether"),
        nonce: await provider.getTransactionCount(address),
        gasLimit: ethers.parseUnits(gas, "wei"),
        gasPrice: await provider.getFeeData().then((fees) => fees.gasPrice),
      };

      const signedTx = await signer.signTransaction(transaction);
      setSignedMessage(signedTx);
      setIsTransactionSigned(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign transaction");
      console.error("Transaction signing error:", err);
    } finally {
      setIsSigning(false);
    }
  };

  if (isSigning) {
    return <LoadingState message="Signing your transaction..." />;
  }

  if (isTransactionSigned) {
    return (
      <div className="min-h-screen flex flex-col bg-background animate-fade-in fill-both">
        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 z-10 backdrop-blur-sm bg-background/80">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setScreen("home")}
            className="text-muted-foreground hover:bg-secondary/10 transition-colors duration-200">
            <X className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-semibold text-foreground">Transaction Signed</h1>
          <div className="w-6" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6 animate-fade-in fill-both">
          <div className="text-center space-y-6">
            <div className="relative inline-flex mb-6">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
              <div className="relative bg-background border border-border rounded-full p-4">
                <Check className="w-12 h-12 text-primary animate-fade-in" />
              </div>
            </div>

            <h2 className="text-xl font-semibold text-foreground">Transaction Successfully Signed</h2>

            <div className="max-w-md mx-auto space-y-4">
              <Alert className="bg-secondary/5 border-secondary/20 text-left">
                <AlertTitle className="flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Transaction Hash
                </AlertTitle>
                <AlertDescription className="mt-2 font-mono text-xs text-muted-foreground break-all">
                  {signedMessage}
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-border animate-slide-in-from-bottom fill-both">
          <Button
            onClick={() => setScreen("home")}
            className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors duration-200">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background animate-fade-in fill-both">
      <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 z-10 backdrop-blur-sm bg-background/80 animate-slide-in-from-top fill-both">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setScreen("home")}
          className="text-muted-foreground hover:bg-secondary/10 transition-colors duration-200">
          <X className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-semibold text-foreground animate-fade-in delay-1 fill-both">Send Transaction</h1>
        <div className="w-6" />
      </div>

      <div className="flex-1 p-4 animate-slide-in-from-bottom delay-2 fill-both">
        <Card className="border-border bg-background">
          <CardContent className="pt-6">
            <form
              onSubmit={handleSubmit}
              className="space-y-6">
              <Alert className="bg-secondary/5 border-secondary/20">
                <AlertTitle className="flex items-center gap-2 text-secondary">
                  <Wallet className="h-4 w-4" />
                  From Address
                </AlertTitle>
                <AlertDescription className="mt-2 font-mono text-sm text-muted-foreground">
                  {address ? `${address.slice(0, 12)}...${address.slice(-6)}` : ""}
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label
                  htmlFor="value"
                  className="text-primary font-medium">
                  Value (in Ether)
                </Label>
                <Input
                  id="value"
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="0.0"
                  required
                  className="bg-primary/5 border-primary/20 text-foreground focus:border-primary focus:ring-primary/30"
                />
              </div>

              <Alert className="bg-muted/5 border-muted/50">
                <AlertTitle className="flex items-center gap-2 text-muted-foreground">
                  <Zap className="h-4 w-4" />
                  Estimated Transaction Fee
                </AlertTitle>
                <AlertDescription className="mt-2 font-mono text-sm text-muted-foreground">
                  {estimatedFee ? `${parseFloat(estimatedFee).toFixed(6)} ETH` : "Calculating..."}
                </AlertDescription>
                <AlertDescription className="mt-1 text-xs text-muted-foreground">Gas: {gas} units</AlertDescription>
              </Alert>

              {error && (
                <Alert
                  variant="destructive"
                  className="animate-fade-in fill-both bg-destructive/10 border-destructive/20">
                  <AlertDescription className="text-destructive">{error}</AlertDescription>
                </Alert>
              )}
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="p-4 mt-auto border-t border-border animate-slide-in-from-bottom delay-3 fill-both">
        <Button
          onClick={handleSubmit}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200">
          Sign Transaction
        </Button>
      </div>
    </div>
  );
};

export default TransactionScreen;
