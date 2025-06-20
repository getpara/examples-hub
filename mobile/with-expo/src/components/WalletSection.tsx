import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { para } from '../para';
import { Button } from './common/Button';
import { StatusDisplay } from './common/StatusDisplay';

interface WalletSectionProps {
  onLogout: () => void;
}

export const WalletSection: React.FC<WalletSectionProps> = ({ onLogout }) => {
  const [walletInfo, setWalletInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [signature, setSignature] = useState('');

  useEffect(() => {
    // Load wallet info on mount
    loadWalletInfo();
  }, []);

  const loadWalletInfo = async () => {
    setLoading(true);
    setError('');
    setStatus('Loading wallet information...');

    try {
      // Get wallet addresses
      const wallets = await para.getWallets();
      
      setWalletInfo({
        wallets
      });
      setStatus('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load wallet info');
    } finally {
      setLoading(false);
    }
  };

  const createWallet = async () => {
    setLoading(true);
    setError('');
    setStatus('Creating new wallet...');

    try {
      // Create an Ethereum wallet
      await para.createWalletPerType({ types: ['EVM'] });
      
      // Reload wallet info
      await loadWalletInfo();
      
      setStatus('Wallet created successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create wallet');
    } finally {
      setLoading(false);
    }
  };

  const signMessage = async () => {
    if (!walletInfo?.wallets?.length) {
      setError('No wallet available');
      return;
    }

    setLoading(true);
    setError('');
    setStatus('Signing message...');
    setSignature('');

    try {
      const message = 'Hello from Para SDK Demo!';
      
      // Sign a message
      const walletId = walletInfo.wallets[0].id || walletInfo.wallets[0].address;
      const messageBase64 = btoa(message);
      
      const sig = await para.signMessage({
        walletId,
        messageBase64
      });
      
      // Handle signature response
      if ('signature' in sig) {
        setSignature(sig.signature);
      } else {
        setError('Failed to get signature');
      }
      
      setStatus('Message signed successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign message');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    setError('');
    setStatus('Logging out...');

    try {
      await para.logout();
      onLogout();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to logout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Wallet Management</Text>

      {walletInfo?.wallets && walletInfo.wallets.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wallets</Text>
          {walletInfo.wallets.map((wallet: any, index: number) => (
            <View key={index} style={styles.walletItem}>
              <Text style={styles.info}>Address: {wallet.address}</Text>
              <Text style={styles.info}>Network: {wallet.network || 'Ethereum'}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.actions}>
        {(!walletInfo?.wallets || walletInfo.wallets.length === 0) && (
          <Button
            title="Create Wallet"
            onPress={createWallet}
            loading={loading}
          />
        )}
        
        {walletInfo?.wallets && walletInfo.wallets.length > 0 && (
          <Button
            title="Sign Test Message"
            onPress={signMessage}
            loading={loading}
          />
        )}

        <Button
          title="Refresh"
          onPress={loadWalletInfo}
          variant="secondary"
          loading={loading}
        />

        <Button
          title="Logout"
          onPress={handleLogout}
          variant="secondary"
          loading={loading}
        />
      </View>

      {signature && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Signature</Text>
          <Text style={styles.signature}>{signature}</Text>
        </View>
      )}

      <StatusDisplay status={status} error={error} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  info: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  walletItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  actions: {
    gap: 12,
    marginBottom: 20,
  },
  signature: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
});