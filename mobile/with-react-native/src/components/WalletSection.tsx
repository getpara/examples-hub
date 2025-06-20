import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { para } from "../para";
import { Button } from "./common/Button";
import { StatusDisplay } from "./common/StatusDisplay";
import { Input } from "./common/Input";

interface WalletSectionProps {
  onLogout: () => void;
}

export const WalletSection: React.FC<WalletSectionProps> = ({ onLogout }) => {
  const [wallet, setWallet] = useState<any>(null);
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [signingMessage, setSigningMessage] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [messageToSign, setMessageToSign] = useState("Hello from Para SDK Demo!");
  const [signature, setSignature] = useState("");

  useEffect(() => {
    // Load or create wallet on component mount
    loadWalletInfo();
  }, []);

  const loadWalletInfo = async () => {
    setLoadingWallet(true);
    setError("");
    setStatus("Loading wallet information...");

    try {
      // Get existing EVM wallets
      const evmWallets = await para.getWalletsByType("EVM");
      console.log("EVM Wallets:", evmWallets);

      if (evmWallets && evmWallets.length > 0) {
        // Use first wallet
        setWallet(evmWallets[0]);
        setStatus("");
      } else {
        // Create new wallet if none exists
        setStatus("No wallet found. Creating new EVM wallet...");
        await para.createWallet({ type: "EVM" });

        // Retrieve newly created wallet
        const newWallets = await para.getWalletsByType("EVM");
        if (newWallets && newWallets.length > 0) {
          setWallet(newWallets[0]);
          setStatus("");
        }
      }
    } catch (err) {
      // Handle error by creating new wallet
      try {
        setStatus("Creating new EVM wallet...");
        await para.createWallet({ type: "EVM" });

        // Retrieve newly created wallet
        const newWallets = await para.getWalletsByType("EVM");
        if (newWallets && newWallets.length > 0) {
          setWallet(newWallets[0]);
          setStatus("");
        }
      } catch (createErr) {
        console.error(createErr);
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
    setStatus("");  // Clear status since button shows loading
    setSignature("");

    try {
      // Convert message to base64 format
      const messageBase64 = btoa(messageToSign);

      // Sign with wallet's private key
      const sig = await para.signMessage({
        walletId: wallet.id,
        messageBase64,
      });

      // Display signature result
      if ("signature" in sig) {
        setSignature(sig.signature);
        setStatus("");
      } else {
        setError("Failed to get signature");
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to sign message");
    } finally {
      setSigningMessage(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    setError("");
    setStatus("Logging out...");

    try {
      // Clear Para session
      await para.logout();
      onLogout();
    } catch (err) {
      console.error(err);
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