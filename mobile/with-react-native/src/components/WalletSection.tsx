import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useWallet, useSignMessage, useLogout, useCreateWallet } from "@getpara/react-native-wallet";
import { Button } from "./common/Button";
import { StatusDisplay } from "./common/StatusDisplay";
import { Input } from "./common/Input";

interface WalletSectionProps {
  onLogout: () => void;
}

export const WalletSection: React.FC<WalletSectionProps> = () => {
  const { data: wallet } = useWallet();
  const { mutateAsync: createWallet } = useCreateWallet();
  const { mutateAsync: signMessageMutation } = useSignMessage();
  const { mutateAsync: logout } = useLogout();
  const [signingMessage, setSigningMessage] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [messageToSign, setMessageToSign] = useState("Hello from Para SDK Demo!");
  const [signature, setSignature] = useState("");

  const handleCreateWallet = async () => {
    setStatus("Creating new EVM wallet...");
    setError("");
    try {
      await createWallet({ type: "EVM" });
      setStatus("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create wallet");
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
    setStatus("");
    setSignature("");

    try {
      const messageBase64 = btoa(messageToSign);
      const sig = await signMessageMutation({ walletId: wallet.id, messageBase64 });
      if ("signature" in sig) {
        setSignature(sig.signature);
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
      await logout({});
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

      {wallet ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EVM Wallet</Text>
          <Text style={styles.info}>ID: {wallet.id}</Text>
          <Text style={styles.info}>Address: {wallet.address}</Text>
          <Text style={styles.info}>Type: EVM</Text>
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.info}>No wallet found.</Text>
          <View style={{ height: 16 }} />
          <Button title="Create Wallet" onPress={handleCreateWallet} />
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
