import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert, Linking, TouchableOpacity } from "react-native";
import { useAccount, useClient, useExportPrivateKey, useWallet } from "@getpara/react-native-wallet";
import { Button } from "./common/Button";
import { StatusDisplay } from "./common/StatusDisplay";

type WalletType = "EVM" | "COSMOS";

function truncateAddr(address: string, chars = 8): string {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export const AccountSection: React.FC = () => {
  const account = useAccount();
  const client = useClient();
  const { data: wallet } = useWallet();
  const { mutateAsync: exportKey, isPending: isExporting } = useExportPrivateKey();

  const [error, setError] = useState("");
  const [selectedType, setSelectedType] = useState<WalletType>("EVM");

  const authMethods = account.authMethods ? Array.from(account.authMethods) : [];

  // Build address views from supported wallet types — mirrors portal page logic
  const addressViews = useMemo<{ type: WalletType; address: string }[]>(() => {
    if (!client || !wallet?.id) return [];
    const supported = (client.supportedWalletTypes ?? [])
      .map(({ type }) => type)
      .filter((t): t is WalletType => t === "EVM" || t === "COSMOS");
    const types: WalletType[] = supported.length > 0 ? supported : ["EVM"];
    return types.map((type) => ({
      type,
      address: client.getDisplayAddress(wallet.id, { addressType: type }) ?? "",
    }));
  }, [client, wallet?.id]);

  const activeView = addressViews.find((v) => v.type === selectedType) ?? addressViews[0];

  const handleExport = () => {
    Alert.alert(
      "Export Private Key",
      "Your private key grants full access to your wallet. Never share it with anyone.\n\nAre you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Export",
          style: "destructive",
          onPress: async () => {
            if (!wallet?.id) return;
            setError("");
            try {
              const result = await exportKey({ walletId: wallet.id });
              if (result?.url) {
                await Linking.openURL(result.url);
              }
            } catch (err) {
              setError(err instanceof Error ? err.message : "Failed to export key");
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Account</Text>

      {/* ── Account Status ── */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Account Status</Text>
          <View style={[styles.badge, account.isConnected ? styles.badgeConnected : styles.badgeDisconnected]}>
            <Text style={[styles.badgeText, account.isConnected ? styles.badgeTextConnected : styles.badgeTextDisconnected]}>
              {account.isConnected ? "Connected" : "Disconnected"}
            </Text>
          </View>
        </View>

        <Text style={styles.label}>User ID</Text>
        <Text style={styles.mono}>{account.userId ?? "—"}</Text>
      </View>

      {/* ── Auth Methods ── */}
      {authMethods.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Auth Methods</Text>
          <View style={styles.badgeRow}>
            {authMethods.map((method) => (
              <View key={String(method)} style={styles.methodBadge}>
                <Text style={styles.methodBadgeText}>
                  {String(method).toLowerCase().replace(/_/g, " ")}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* ── Export Private Key ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>

        {/* Wallet address display — mirrors portal page */}
        {activeView && (
          <View style={styles.walletBlock}>
            <Text style={styles.label}>Wallet</Text>
            {addressViews.length > 1 ? (
              // Picker when both EVM + Cosmos are supported
              <View style={styles.addressPicker}>
                {addressViews.map((view, i) => (
                  <TouchableOpacity
                    key={view.type}
                    style={[
                      styles.addressRow,
                      i < addressViews.length - 1 && styles.addressRowBorder,
                      selectedType === view.type && styles.addressRowSelected,
                    ]}
                    onPress={() => setSelectedType(view.type)}
                    activeOpacity={0.7}>
                    <View style={styles.addressRowLeft}>
                      <View style={[styles.typeBadge, view.type === "EVM" ? styles.evmBadge : styles.cosmosBadge]}>
                        <Text style={[styles.typeBadgeText, view.type === "EVM" ? styles.evmBadgeText : styles.cosmosBadgeText]}>
                          {view.type}
                        </Text>
                      </View>
                      <Text style={styles.mono}>{truncateAddr(view.address)}</Text>
                    </View>
                    {selectedType === view.type && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              // Single address inline
              <View style={styles.addressRowSingle}>
                <View style={[styles.typeBadge, activeView.type === "EVM" ? styles.evmBadge : styles.cosmosBadge]}>
                  <Text style={[styles.typeBadgeText, activeView.type === "EVM" ? styles.evmBadgeText : styles.cosmosBadgeText]}>
                    {activeView.type}
                  </Text>
                </View>
                <Text style={styles.mono}>{truncateAddr(activeView.address)}</Text>
              </View>
            )}
          </View>
        )}

        <Text style={styles.info}>
          Export your wallet's private key for use in other applications. Keep it safe —
          anyone with your key controls your wallet.
        </Text>
        <View style={{ height: 16 }} />
        <Button
          title={isExporting ? "Exporting…" : "Export Private Key"}
          onPress={handleExport}
          variant="secondary"
          loading={isExporting}
          disabled={!wallet?.id}
        />

        <StatusDisplay error={error} />
      </View>
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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeConnected: { backgroundColor: "#D1FAE5" },
  badgeDisconnected: { backgroundColor: "#F3F4F6" },
  badgeText: { fontSize: 12, fontWeight: "500" },
  badgeTextConnected: { color: "#065F46" },
  badgeTextDisconnected: { color: "#6B7280" },
  warningBox: {
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FCD34D",
    borderRadius: 4,
    padding: 12,
    marginBottom: 12,
  },
  warningText: { fontSize: 13, color: "#92400E" },
  label: { fontSize: 12, color: "#666666", marginBottom: 4, marginTop: 8 },
  mono: { fontSize: 13, fontFamily: "monospace", color: "#000000" },
  info: { fontSize: 14, color: "#666666", lineHeight: 20 },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  methodBadge: {
    backgroundColor: "#E0E7FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  methodBadgeText: {
    fontSize: 12,
    color: "#3730A3",
    fontWeight: "500",
    textTransform: "capitalize",
  },
  walletBlock: { marginBottom: 12 },
  addressPicker: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  addressRowBorder: { borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  addressRowSelected: { backgroundColor: "#F9FAFB" },
  addressRowLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  addressRowSingle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  typeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  evmBadge: { backgroundColor: "#E0E7FF" },
  cosmosBadge: { backgroundColor: "#F3E8FF" },
  typeBadgeText: { fontSize: 11, fontWeight: "600" },
  evmBadgeText: { color: "#3730A3" },
  cosmosBadgeText: { color: "#6B21A8" },
  checkmark: { fontSize: 14, color: "#000000", fontWeight: "600" },
});
