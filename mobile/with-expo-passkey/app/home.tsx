import { useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
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
            {wallets.length > 0
              ? `${wallets.length} wallet${wallets.length === 1 ? '' : 's'} found`
              : 'No wallets'}
          </Text>
        </View>

        {wallets.length > 0 ? (
          <FlatList
            data={wallets}
            keyExtractor={(item, idx) => item.id ?? `${idx}`}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View style={styles.walletCard}>
                <View style={styles.walletTypeBadge}>
                  <Text style={styles.walletTypeText}>{item.type ?? 'UNKNOWN'}</Text>
                </View>
                <Text style={styles.walletAddress}>
                  {item.address ? truncateAddress(item.address) : 'No address'}
                </Text>
              </View>
            )}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No wallets found</Text>
          </View>
        )}

        <View style={styles.signCard}>
          <Text style={styles.signLabel}>Sign Message</Text>
          <Pressable
            style={({ pressed }) => [
              styles.signButton,
              pressed && !signing && viemClient && styles.signButtonPressed,
              (!viemClient || signing) && styles.signButtonDisabled,
            ]}
            onPress={handleSign}
            disabled={!viemClient || signing}
          >
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

        <Pressable
          style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutButtonPressed]}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF9',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1C1917',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#78716C',
  },
  list: {
    gap: 12,
  },
  walletCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7E5E4',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  walletTypeBadge: {
    backgroundColor: '#FFF7ED',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  walletTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E8642B',
  },
  walletAddress: {
    fontSize: 14,
    color: '#1C1917',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#78716C',
  },
  signCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7E5E4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  signLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1917',
  },
  signButton: {
    backgroundColor: '#E8642B',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  signButtonPressed: {
    opacity: 0.85,
  },
  signButtonDisabled: {
    opacity: 0.6,
  },
  signButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  signatureBox: {
    backgroundColor: '#F5F5F4',
    borderRadius: 8,
    padding: 12,
  },
  signatureText: {
    fontSize: 12,
    color: '#1C1917',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  logoutButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7E5E4',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  logoutButtonPressed: {
    backgroundColor: '#F5F5F4',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
  },
});
