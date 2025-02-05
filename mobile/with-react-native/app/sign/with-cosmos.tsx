import React, { useState, useEffect } from "react";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { SigningStargateClient } from "@cosmjs/stargate";
import { WalletType } from "@usecapsule/react-native-wallet";
import { CapsuleProtoSigner } from "@usecapsule/cosmjs-v0-integration";
import { capsuleClient } from "../../client/capsule";
import TransactionScreen from "../../components/TransactionScreen";
import { RootStackParamList } from "../../types";

const RPC_ENDPOINT = "https://cosmos-rpc.publicnode.com:443";

export default function CosmosSendScreen() {
  const [fromAddress, setFromAddress] = useState("");
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  useEffect(() => {
    const initializeAddress = async () => {
      try {
        const wallet = await capsuleClient.getWalletsByType(WalletType.COSMOS)[0];
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
      const protoSigner = new CapsuleProtoSigner(capsuleClient, "cosmos");
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
      onBack={() => navigation.navigate("Home")}
    />
  );
}
