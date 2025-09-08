import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { para } from "../para";
import { Button } from "./common/Button";
import { StatusDisplay } from "./common/StatusDisplay";
import { Input } from "./common/Input";
import { Wallet } from "@getpara/react-native-wallet";
import { ethers } from "ethers";
import { ParaEthersSigner } from "@getpara/ethers-v6-integration";

interface WalletSectionProps {
  onLogout: () => void;
}

export const WalletSection: React.FC<WalletSectionProps> = ({ onLogout }) => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [_loadingWallet, setLoadingWallet] = useState(false);
  const [signingMessage, setSigningMessage] = useState(false);
  const [signingTransaction, setSigningTransaction] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [messageToSign, setMessageToSign] = useState("Hello from Para SDK Demo!");
  const [signature, setSignature] = useState("");
  const [txSignature, setTxSignature] = useState("");

  useEffect(() => {
    // Fetch user's wallet on component mount
    loadWalletInfo();
  }, []);

  const loadWalletInfo = async () => {
    setLoadingWallet(true);
    setError("");
    setStatus("Loading wallet information...");

    try {
      // Para manages multiple wallet types - here we fetch EVM wallets
      const evmWallets = await para.getWalletsByType("EVM");

      if (evmWallets && evmWallets.length > 0) {
        // Use first wallet if exists
        setWallet(evmWallets[0]);
        setStatus("");
      } else {
        // Auto-create wallet for new users
        setStatus("No wallet found. Creating new EVM wallet...");
        await para.createWallet({ type: "EVM" });

        // Get the newly created wallet
        const newWallets = await para.getWalletsByType("EVM");
        if (newWallets && newWallets.length > 0) {
          setWallet(newWallets[0]);
          setStatus("");
        }
      }
    } catch (_err) {
      // If getWalletsByType throws an error (no wallet), create one
      try {
        setStatus("Creating new EVM wallet...");
        await para.createWallet({ type: "EVM" });

        // Get the newly created wallet
        const newWallets = await para.getWalletsByType("EVM");
        if (newWallets && newWallets.length > 0) {
          setWallet(newWallets[0]);
          setStatus("");
        }
      } catch (createErr) {
        setError(createErr instanceof Error ? createErr.message : "Failed to create wallet");
      }
    } finally {
      setLoadingWallet(false);
    }
  };

  const signMessage = async () => {
    if (!wallet) {
      setError("No wallet available");
      return;
    }

    if (!messageToSign.trim()) {
      setError("Please enter a message to sign");
      return;
    }

    setSigningMessage(true);
    setError("");
    setStatus(""); // Clear status since button shows loading
    setSignature("");

    try {
      // Para requires base64 encoded messages
      const messageBase64 = btoa(messageToSign);

      // Sign with wallet's private key (managed by Para)
      const sig = await para.signMessage({
        walletId: wallet.id,
        messageBase64,
      });

      // Signature is returned in hex format
      if ("signature" in sig) {
        setSignature(sig.signature);
        setStatus("");
      } else {
        setError("Failed to get signature");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign message");
    } finally {
      setSigningMessage(false);
    }
  };

  const signTransaction = async () => {
    if (!wallet) {
      setError("No wallet available");
      return;
    }

    setSigningTransaction(true);
    setError("");
    setStatus("");
    setTxSignature("");

    try {
      // Create provider for Sepolia testnet
      const provider = new ethers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");
      
      // Create Para-enabled signer as per documentation
      // @ts-expect-error - ParaMobile extends ParaCore but types aren't compatible
      const signer = new ParaEthersSigner(para, provider);

      // Create transaction object
      const tx = {
        to: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
        value: ethers.parseEther("0.001"), // 0.001 ETH
        gasLimit: 21000, // Standard ETH transfer gas
      };

      // Populate the transaction with necessary fields (nonce, gas prices, etc)
      const populatedTx = await signer.populateTransaction(tx);
      
      // Sign the transaction without broadcasting
      const signedTx = await signer.signTransaction(populatedTx);
      
      // Display the signed transaction
      setTxSignature(signedTx);
      setStatus("");
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign transaction");
    } finally {
      setSigningTransaction(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    setError("");
    setStatus("Logging out...");

    try {
      // Clear local session - wallet keys remain secure on Para's infrastructure
      await para.logout();
      onLogout();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to logout");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Wallet Management</Text>

      {wallet && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EVM Wallet</Text>
          <Text style={styles.info}>ID: {wallet.id}</Text>
          <Text style={styles.info}>Address: {wallet.address}</Text>
          <Text style={styles.info}>Type: EVM</Text>
        </View>
      )}

      {wallet && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sign Message</Text>
          <Input
            label="Message to Sign"
            value={messageToSign}
            onChangeText={setMessageToSign}
            placeholder="Enter message to sign"
          />
          <View style={{ height: 16 }} />
          <Button
            title="Sign Message"
            onPress={signMessage}
            loading={signingMessage}
          />

          {signature && (
            <View style={styles.signatureContainer}>
              <Text style={styles.resultLabel}>Signature Result</Text>
              <Text style={styles.signature}>{signature}</Text>
            </View>
          )}
        </View>
      )}

      {wallet && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sign Transaction</Text>
          <Text style={styles.info}>Sign a transaction to send 0.001 ETH (Sepolia)</Text>
          <View style={{ height: 16 }} />
          <Button
            title="Sign Transaction"
            onPress={signTransaction}
            loading={signingTransaction}
          />

          {txSignature && (
            <View style={styles.signatureContainer}>
              <Text style={styles.resultLabel}>Signed Transaction</Text>
              <Text style={styles.signature}>{txSignature}</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.actions}>
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="secondary"
          loading={loggingOut}
        />
      </View>

      <StatusDisplay
        status={status}
        error={error}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 24,
    color: "#000000",
  },
  section: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: "#F8F8F8",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#000000",
  },
  info: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 4,
  },
  actions: {
    marginBottom: 20,
  },
  signature: {
    fontSize: 12,
    color: "#333333",
    fontFamily: "monospace",
    lineHeight: 18,
    backgroundColor: "#FAFAFA",
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  signatureContainer: {
    marginTop: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
    padding: 16,
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderStyle: "dashed",
  },
  resultLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 12,
    color: "#000000",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
