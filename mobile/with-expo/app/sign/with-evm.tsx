import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { CapsuleEthersSigner } from "@usecapsule/ethers-v6-integration";
import { createCapsuleViemClient, createCapsuleAccount } from "@usecapsule/viem-v2-integration";
import { capsuleClient } from "@/client/capsule";
import { WalletType } from "@usecapsule/react-native-wallet";
import { http, parseEther, parseGwei } from "viem";
import { sepolia } from "viem/chains";
import TransactionScreen from "@/components/TransactionScreen";
import { useRouter } from "expo-router";

const RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com";
const signingOptions = [
  { value: "Ethers", key: "ethers" },
  { value: "Viem", key: "viem" },
];

export default function EVMSendScreen() {
  const [fromAddress, setFromAddress] = useState("");

  const router = useRouter();

  useEffect(() => {
    const initializeAddress = async () => {
      try {
        const wallet = await capsuleClient.getWalletsByType(WalletType.EVM)[0];
        if (wallet?.address) {
          setFromAddress(wallet.address);
        }
      } catch (error) {
        console.error("Error fetching EVM wallet:", error);
      }
    };

    initializeAddress();
  }, []);

  const handleSign = async (toAddress: string, amount: string, signingMethod: string = "ethers") => {
    try {
      switch (signingMethod) {
        case "ethers":
          await signWithEthers(toAddress, amount);
          break;
        case "viem":
          await signWithViem(toAddress, amount);
          break;
        default:
          await signWithEthers(toAddress, amount);
      }
    } catch (error) {
      console.error("Error signing EVM transaction:", error);
      throw error;
    }
  };

  const signWithEthers = async (toAddress: string, amount: string) => {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const ethersSigner = new CapsuleEthersSigner(capsuleClient, provider);

    const transaction = {
      from: fromAddress,
      to: toAddress,
      value: ethers.parseUnits(amount, "ether"),
      gasLimit: "21000",
      gasPrice: await provider.getFeeData().then((fees) => fees.gasPrice),
    };

    await ethersSigner.signTransaction(transaction);
  };

  const signWithViem = async (toAddress: string, amount: string) => {
    const viemCapsuleAccount = await createCapsuleAccount(capsuleClient);

    const capsuleViemSigner = createCapsuleViemClient(capsuleClient, {
      account: viemCapsuleAccount,
      chain: sepolia,
      transport: http(RPC_URL),
    });

    const transaction = {
      account: viemCapsuleAccount,
      chain: sepolia,
      to: toAddress as `0x${string}`,
      value: parseEther(amount),
      gas: parseGwei("21000"),
      gasPrice: parseEther("0.000000001"),
    };

    await capsuleViemSigner.signTransaction(transaction);
  };

  return (
    <TransactionScreen
      type={WalletType.EVM}
      title="Send EVM Transaction"
      fromAddress={fromAddress}
      signingOptions={signingOptions}
      amountLabel="Amount (ETH)"
      defaultSigningMethod="ethers"
      onSign={handleSign}
      onBack={() => router.push("/home")}
    />
  );
}
