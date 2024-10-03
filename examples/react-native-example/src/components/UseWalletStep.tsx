import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import Toast from 'react-native-toast-message';
import Clipboard from '@react-native-clipboard/clipboard';
import { capsule } from '../clients/capsule';
import { Button } from './Button';
import { CapsuleSolanaWeb3Signer } from '@usecapsule/solana-web3.js-v1-integration';
import * as solana from '@solana/web3.js';

interface UseWalletStepProps {
  onLogout: () => void;
}

const TX_MESSAGE = 'hello';

const UseWalletStep: React.FC<UseWalletStepProps> = ({ onLogout }) => {
  const [walletInfo, setWalletInfo] = useState({
    id: '',
    address: '',
    solanaAddress: '',
  });
  const [email, setEmail] = useState('');
  const [txSignature, setTXSignature] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchWalletInfo();
    setEmail(capsule.getEmail() ?? '');
  }, []);

  const fetchWalletInfo = () => {
    const allWallets = capsule.getWallets();
    const firstWalletId = Object.keys(allWallets)[0];
    setWalletInfo({
      id: firstWalletId,
      address: allWallets[firstWalletId]?.address ?? '',
      solanaAddress: Object.values(capsule.getED25519Wallets())[0]?.address ?? '',
    });
  };

  const handleCreateWallet = async () => {
    try {
      setIsLoading(true);
      await capsule.createWalletPerMissingType();
      showSuccessToast('Wallet created successfully!');
      fetchWalletInfo();
    } catch (error) {
      handleError('Wallet Creation Error', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Are you sure you want to logout?',
      undefined,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          onPress: async () => {
            await capsule.logout();
            onLogout();
          },
        },
      ],
      { userInterfaceStyle: 'dark' },
    );
  };

  const handleSignSampleTX = async () => {
    try {
      setIsLoading(true);
      const resp = await capsule.signMessage(
        walletInfo.id,
        Buffer.from('1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8', 'hex').toString('base64'),
      );
      showSuccessToast('TX signed successfully!');
      setTXSignature(`0x${(resp as any).signature}`);
    } catch (error) {
      handleError('TX Sign Error', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendSampleSolanaTx = async () => {
    try {
      setIsLoading(true);
      const SOLANA_RECIPIENT_PUBLIC_KEY = '4TUYF5Q6sCkBCjamQrTkNYJyxhyaCPiPnq9oVg6qXbTp';
      const SOLANA_DEVNET_RPC_ENDPOINT = 'https://api.devnet.solana.com';

      const connection = new solana.Connection(SOLANA_DEVNET_RPC_ENDPOINT, 'confirmed');
      const solanaSigner = new CapsuleSolanaWeb3Signer(capsule, connection);
      const tx = new solana.Transaction().add(
        solana.SystemProgram.transfer({
          fromPubkey: solanaSigner.sender,
          toPubkey: new solana.PublicKey(SOLANA_RECIPIENT_PUBLIC_KEY),
          lamports: 0.03003 * solana.LAMPORTS_PER_SOL,
        }),
      );
      tx.feePayer = solanaSigner.sender;

      const rawTxRes = await solanaSigner.sendTransaction(tx, {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });
      showSuccessToast('Solana TX signed successfully!');
      setTXSignature(rawTxRes);
    } catch (error) {
      handleError('Solana TX Sign Error', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = (errorType: string, error: any) => {
    console.error(`${errorType}: `, error);
    showErrorToast('An error occurred. Please try again.');
  };

  const showSuccessToast = (message: string) => {
    Toast.show({ type: 'success', text1: `🔥 ${message} 🔥` });
  };

  const showErrorToast = (message: string) => {
    Toast.show({ type: 'error', text1: message });
  };

  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
  };

  const renderInfoItem = (label: string, value: string) => (
    <TouchableOpacity onPress={() => copyToClipboard(value)}>
      <Text style={styles.label}>{label}:</Text>
      <Text style={styles.value}>{value}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Press any field to copy</Text>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {renderInfoItem('Email', email)}
        {walletInfo.id && (
          <>
            {renderInfoItem('Wallet ID', walletInfo.id)}
            {renderInfoItem('Wallet Address', walletInfo.address)}
            {walletInfo.solanaAddress && renderInfoItem('Solana Wallet Address', walletInfo.solanaAddress)}
          </>
        )}
        {txSignature && (
          <>
            {renderInfoItem('TX Message', TX_MESSAGE)}
            {renderInfoItem('TX Signature', txSignature)}
          </>
        )}
      </ScrollView>
      <View style={styles.buttonContainer}>
        {!walletInfo.id ? (
          <Button onPress={handleCreateWallet} title="Create Wallet" isLoading={isLoading} />
        ) : (
          <>
            <Button onPress={handleSignSampleTX} title="Sign Sample TX" isLoading={isLoading} />
            <Button onPress={handleSendSampleSolanaTx} title="Send Sample Solana TX" isLoading={isLoading} />
          </>
        )}
        <Button onPress={handleLogout} title="Logout" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 36,
  },
  header: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    paddingBottom: 16,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  label: {
    color: 'white',
    fontSize: 16,
    paddingTop: 16,
  },
  value: {
    color: 'white',
    fontSize: 16,
  },
  buttonContainer: {
    justifyContent: 'flex-end',
    gap: 16,
  },
});

export default UseWalletStep;
