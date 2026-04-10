import { useCallback } from 'react';
import { View, Text, Pressable, FlatList, ActivityIndicator, StyleSheet, Platform, ScrollView } from 'react-native';
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

  const handleLogout = useCallback(async () => {
    try {
      await logoutAsync();
    } finally {
      router.replace('/');
    }
  }, [router, logoutAsync]);

  async function handleSign() {
    try {
      await signMessageAsync({ message: 'Hello from Para!' });
    } catch {}
  }

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
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>Your Wallets</Text>

        {wallets.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No wallets</Text>
            <Text style={styles.emptySubtitle}>No wallets were found for this account.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {wallets.map((w) => (
              <WalletCard key={w.id} wallet={w} />
            ))}
          </View>
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
            <View style={styles.signatureContainer}>
              <Text style={styles.signatureText}>{signature}</Text>
            </View>
          )}
        </View>

        <Pressable
          style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutButtonPressed]}
          onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function WalletCard({ wallet }: { wallet: { type?: string; address?: string } }) {
  const walletType = wallet.type ?? 'UNKNOWN';
  const address = wallet.address ?? 'No address';

  return (
    <View style={styles.card}>
      <View style={styles.walletTypeContainer}>
        <Text style={styles.walletType}>{walletType}</Text>
      </View>
      <Text style={styles.walletAddress}>{truncateAddress(address)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF9',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  contentContainer: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1917',
    marginBottom: 24,
  },
  logoutButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E7E5E4',
    alignItems: 'center',
  },
  logoutButtonPressed: {
    backgroundColor: '#F5F5F4',
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#DC2626',
  },
  list: {
    gap: 12,
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E7E5E4',
  },
  walletTypeContainer: {
    backgroundColor: '#FFF7ED',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  walletType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E8642B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  walletAddress: {
    fontSize: 16,
    color: '#1C1917',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1917',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#78716C',
    textAlign: 'center',
  },
  signCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E7E5E4',
    marginBottom: 16,
  },
  signLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1917',
    marginBottom: 12,
  },
  signButton: {
    backgroundColor: '#E8642B',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  signButtonPressed: {
    opacity: 0.85,
  },
  signButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  signatureContainer: {
    backgroundColor: '#F5F5F4',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  signatureText: {
    fontSize: 12,
    color: '#1C1917',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});
