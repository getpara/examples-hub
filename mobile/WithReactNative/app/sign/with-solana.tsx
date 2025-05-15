import React, {useState, useEffect} from 'react';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {
  Connection,
  clusterApiUrl,
  SystemProgram,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
  SendOptions,
} from '@solana/web3.js';
import {WalletType} from '@getpara/react-native-wallet';
import {ParaSolanaWeb3Signer} from '@getpara/solana-web3.js-v1-integration';
import TransactionScreen from '../../components/TransactionScreen';
import {para} from '../../client/para';
import {RootStackParamList} from '../../types';

// It's better to use a more reliable public RPC or your own.
// Devnet is generally safer for testing transactions.
const SOLANA_RPC_ENDPOINT = clusterApiUrl('devnet');

export default function SolanaSendScreen() {
  const [fromAddress, setFromAddress] = useState('');
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  useEffect(() => {
    const initializeAddress = async () => {
      try {
        const wallet = para.getWalletsByType(WalletType.SOLANA)[0]; // Removed await
        if (wallet?.address) {
          setFromAddress(wallet.address);
        }
      } catch (error) {
        console.error('Error fetching Solana wallet:', error);
        // Consider user-facing error message
      }
    };

    initializeAddress();
  }, []);

  const handleSign = async (toAddress: string, amount: string) => {
    if (!fromAddress) {
      console.error('From address is not set.');
      // Alert.alert("Error", "Sender address is missing.");
      return;
    }
    try {
      const connection = new Connection(SOLANA_RPC_ENDPOINT, 'confirmed');
      // Ensure fromAddress is passed if your ParaSolanaWeb3Signer needs it for initialization or to resolve the sender PublicKey
      const solanaSigner = new ParaSolanaWeb3Signer(para, connection, new PublicKey(fromAddress));

      if (!solanaSigner.sender) {
        throw new Error('Solana signer sender public key not available.');
      }

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: solanaSigner.sender, // Relies on solanaSigner.sender being correctly set
          toPubkey: new PublicKey(toAddress),
          lamports: LAMPORTS_PER_SOL * parseFloat(amount),
        }),
      );

      // Get a recent blockhash
      const {blockhash} = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = solanaSigner.sender; // The signer is usually the fee payer

      console.log('Signing Solana Tx:', transaction);

      // The ParaSolanaWeb3Signer's sendTransaction might sign and send.
      // If it only signs, you'd use connection.sendRawTransaction after signing.
      const sendOptions: SendOptions = {
        skipPreflight: false, // It's generally safer to keep preflight for testing
        preflightCommitment: 'confirmed',
      };

      const signature = await solanaSigner.sendTransaction(transaction, sendOptions);

      console.log('Solana Transaction signature:', signature);
      // await connection.confirmTransaction(signature, "confirmed");
      // Alert.alert("Success", `Transaction sent: ${signature}`);
      navigation.navigate('Home');
    } catch (error) {
      console.error('Error signing Solana transaction:', error);
      // Alert.alert("Error", error instanceof Error ? error.message : "Failed to sign transaction");
      // throw error;
    }
  };

  return (
    <TransactionScreen
      type={WalletType.SOLANA}
      title="Send Solana Transaction"
      fromAddress={fromAddress}
      amountLabel="Amount (SOL)"
      onSign={handleSign}
      onBack={() => navigation.navigate('Home')}
    />
  );
}
