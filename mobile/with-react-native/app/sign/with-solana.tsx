import React, { useState, useEffect } from "react";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { Connection, clusterApiUrl, SystemProgram, LAMPORTS_PER_SOL, PublicKey, Transaction } from "@solana/web3.js";
import { WalletType } from "@getpara/react-native-wallet";
import { ParaSolanaWeb3Signer } from "@getpara/solana-web3.js-v1-integration";
import TransactionScreen from "../../components/TransactionScreen";
import { para } from "../../client/para";
import { RootStackParamList } from "../../types";

export default function SolanaSendScreen() {
  const [fromAddress, setFromAddress] = useState("");
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  useEffect(() => {
    const initializeAddress = async () => {
      try {
        const wallet = await para.getWalletsByType(WalletType.SOLANA)[0];
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
      const solanaSigner = new ParaSolanaWeb3Signer(para, connection);

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

      console.log("Transaction signature:", signature);
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
      onBack={() => navigation.navigate("Home")}
    />
  );
}
