import { useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useLogout, useAccount } from '@getpara/react-native-wallet';
import { useParaViemClient, useParaViemSignMessage } from '@getpara/react-native-wallet/evm/viem';
import { http } from 'viem';
import { sepolia } from 'viem/chains';
import { truncateAddress } from '@/lib/auth';

export default function HomeScreen() {
  const router = useRouter();
  const { logoutAsync } = useLogout();
  const { embedded, isConnected } = useAccount();
  const wallets = embedded?.wallets ?? [];

  const { viemClient } = useParaViemClient({
    walletClientConfig: { chain: sepolia, transport: http() },
  });
  const { signMessageAsync, data: signature, isPending: signing } = useParaViemSignMessage(viemClient);

  async function handleSign() {
    try {
      await signMessageAsync({ message: 'Hello from Para!' });
    } catch {}
  }

  const handleLogout = useCallback(async () => {
    await logoutAsync();
    router.replace('/');
  }, [router, logoutAsync]);

  if (!isConnected) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#E8642B" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Wallets</Text>
          <Text style={styles.subtitle}>
            {wallets.length} wallet{wallets.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {wallets.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No wallets found.</Text>
          </View>
        ) : (
          <FlatList
            data={wallets}
            keyExtractor={(item, idx) => item.id ?? `${idx}`}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => <WalletCard wallet={item} />}
          />
        )}

        <View style={styles.signCard}>
          <Text style={styles.signLabel}>Sign Message</Text>
          <Pressable
            style={({ pressed }) => [styles.signButton, pressed && styles.signButtonPressed]}
            onPress={handleSign}
            disabled={signing || !viemClient}>
            {signing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.signButtonText}>Sign "Hello from Para!"</Text>
            )}
          </Pressable>
          {signature && (
            <View style={styles.signatureBox}>
              <Text style={styles.signatureText} selectable>
                {signature}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.spacer} />

        <Pressable
          style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutButtonPressed]}
          onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function WalletCard({ wallet }: { wallet: { type?: string; address?: string } }) {
  const walletType = wallet.type ?? 'UNKNOWN';
  const address = wallet.address ?? 'No address';

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>{walletType}</Text>
        </View>
      </View>
      <Text style={styles.addressText}>{truncateAddress(address)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF9' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 16 },
  header: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '700', color: '#1C1917', letterSpacing: -0.3 },
  subtitle: { fontSize: 14, color: '#78716C', marginTop: 4 },
  list: { gap: 12 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E7E5E4',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  typeBadge: {
    backgroundColor: '#FFF7ED',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  typeBadgeText: { color: '#E8642B', fontSize: 12, fontWeight: '600' },
  addressText: { color: '#1C1917', fontSize: 15, fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }) },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E7E5E4',
  },
  emptyText: { color: '#78716C', fontSize: 15 },
  signCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E7E5E4',
  },
  signLabel: { fontSize: 16, fontWeight: '600', color: '#1C1917', marginBottom: 12 },
  signButton: {
    backgroundColor: '#E8642B',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  signButtonPressed: { opacity: 0.85 },
  signButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  signatureBox: {
    backgroundColor: '#F5F5F4',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  signatureText: {
    color: '#1C1917',
    fontSize: 12,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
  },
  spacer: { flex: 1 },
  logoutButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E7E5E4',
  },
  logoutButtonPressed: { backgroundColor: '#F5F5F4' },
  logoutText: { color: '#DC2626', fontSize: 16, fontWeight: '600' },
});
