import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, Button, Badge } from "@rneui/themed";
import Clipboard from "@react-native-clipboard/clipboard";
import { WalletType } from "@getpara/react-native-wallet";

interface WalletCardProps {
  type: WalletType;
  address?: string;
  networkName: string;
  onSend: () => void;
  onCreate: () => void;
}

const truncateAddress = (address: string) => {
  return `${address.slice(0, 12)}...${address.slice(-8)}`;
};

export default function WalletCard({ type, address, networkName, onSend, onCreate }: WalletCardProps) {
  const copyToClipboard = async () => {
    if (address) {
      await Clipboard.setString(address);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.cardTitle}>{type} Wallet</Text>
        <Badge
          value={networkName}
          status="primary"
        />
      </View>
      {address ? (
        <>
          <TouchableOpacity onPress={copyToClipboard}>
            <Text style={styles.address}>{truncateAddress(address)}</Text>
          </TouchableOpacity>
          <View style={styles.buttonContainerRow}>
            <Button
              title="Sign Test Tx"
              onPress={onSend}
              type="outline"
              containerStyle={styles.buttonContainer}
              buttonStyle={styles.outlineButton}
              titleStyle={styles.outlineButtonTitle}
            />
          </View>
        </>
      ) : (
        <Button
          title="Create Wallet"
          onPress={onCreate}
          buttonStyle={styles.createButton}
          containerStyle={styles.createButtonContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    color: "#333333",
    textAlign: "left",
    fontWeight: "bold",
    fontSize: 20,
  },
  address: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 16,
    textAlign: "center",
  },
  buttonContainerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  buttonContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  outlineButton: {
    borderColor: "#fc6c58",
    borderWidth: 1,
    borderRadius: 8,
  },
  outlineButtonTitle: {
    color: "#fc6c58",
  },
  createButtonContainer: {
    width: "100%",
  },
  createButton: {
    backgroundColor: "#fc6c58",
    borderRadius: 8,
    paddingVertical: 12,
  },
});