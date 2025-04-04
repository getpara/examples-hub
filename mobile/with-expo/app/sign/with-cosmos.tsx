import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { SigningStargateClient } from "@cosmjs/stargate";
import { WalletType } from "@getpara/react-native-wallet";
import { ParaProtoSigner } from "@getpara/cosmjs-v0-integration";
import { para } from "@/client/para";
import TransactionScreen from "@/components/TransactionScreen";

const RPC_ENDPOINT = "https://cosmos-rpc.publicnode.com:443";

export default function CosmosSendScreen() {
  const [fromAddress, setFromAddress] = useState("");

  const router = useRouter();

  useEffect(() => {
    const initializeAddress = async () => {
      try {
        const wallet = await para.getWalletsByType(WalletType.COSMOS)[0];
        if (wallet?.address) {
          setFromAddress(wallet.address);
        }
      } catch (error) {
        console.error("Error fetching Cosmos wallet:", error);
      }
    };

    initializeAddress();
  }, []);

  const handleSign = async (toAddress: string, amount: string) => {
    try {
      const protoSigner = new ParaProtoSigner(para, "cosmos");
      const client = await SigningStargateClient.connectWithSigner(RPC_ENDPOINT, protoSigner);

      const amountInUAtom = {
        denom: "uatom",
        amount: (parseFloat(amount) * 1_000_000).toString(),
      };

      const fee = {
        amount: [{ denom: "uatom", amount: "500" }],
        gas: "200000",
      };

      await client.sendTokens(fromAddress, toAddress, [amountInUAtom], fee, "Sent via CosmJS");
    } catch (error) {
      console.error("Error signing Cosmos transaction:", error);
      throw error;
    }
  };

  return (
    <TransactionScreen
      type={WalletType.COSMOS}
      title="Send Cosmos Transaction"
      fromAddress={fromAddress}
      amountLabel="Amount (uATOM)"
      onSign={handleSign}
      onBack={() => router.push("/home")}
    />
  );
}
