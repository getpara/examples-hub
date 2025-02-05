import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { Connection, clusterApiUrl, SystemProgram, LAMPORTS_PER_SOL, PublicKey, Transaction } from "@solana/web3.js";
import { CapsuleSolanaWeb3Signer } from "@usecapsule/solana-web3.js-v1-integration";
import { capsuleClient } from "@/client/capsule";
import { WalletType } from "@usecapsule/react-native-wallet";
import TransactionScreen from "@/components/TransactionScreen";

export default function SolanaSendScreen() {
  const [fromAddress, setFromAddress] = useState("");

  const router = useRouter();

  useEffect(() => {
    const initializeAddress = async () => {
      try {
        const wallet = await capsuleClient.getWalletsByType(WalletType.SOLANA)[0];
        if (wallet?.address) {
          setFromAddress(wallet.address);
        }
      } catch (error) {
        console.error("Error fetching Solana wallet:", error);
      }
    };

    initializeAddress();
  }, []);

  const handleSign = async (toAddress: string, amount: string) => {
    try {
      const connection = new Connection(clusterApiUrl("mainnet-beta"));
      const solanaSigner = new CapsuleSolanaWeb3Signer(capsuleClient, connection);

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: solanaSigner.sender!,
          toPubkey: new PublicKey(toAddress),
          lamports: LAMPORTS_PER_SOL * parseFloat(amount),
        })
      );

      const signature = await solanaSigner.sendTransaction(transaction, {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      });

    } catch (error) {
      console.error("Error signing Solana transaction:", error);
      throw error;
    }
  };

  return (
    <TransactionScreen
      type={WalletType.SOLANA}
      title="Send Solana Transaction"
      fromAddress={fromAddress}
      amountLabel="Amount (SOL)"
      onSign={handleSign}
      onBack={() => router.push("/home")}
    />
  );
}
