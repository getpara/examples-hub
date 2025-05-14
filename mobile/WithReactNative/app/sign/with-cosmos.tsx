import React, {useState, useEffect} from 'react';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {SigningStargateClient, StdFee} from '@cosmjs/stargate'; // Added StdFee
import {WalletType} from '@getpara/react-native-wallet';
import {ParaProtoSigner} from '@getpara/cosmjs-v0-integration';
import {para} from '../../client/para';
import TransactionScreen from '../../components/TransactionScreen';
import {RootStackParamList} from '../../types';

// Consider making RPC_ENDPOINT configurable or an environment variable
const RPC_ENDPOINT = 'https://cosmos-rpc.publicnode.com:443';
const DEFAULT_DENOM = 'uatom';
const DEFAULT_GAS_PRICE = '0.025' + DEFAULT_DENOM; // Example gas price
const DEFAULT_GAS_LIMIT = '200000';

export default function CosmosSendScreen() {
  const [fromAddress, setFromAddress] = useState('');
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  useEffect(() => {
    const initializeAddress = async () => {
      try {
        const wallet = para.getWalletsByType(WalletType.COSMOS)[0]; // Removed await
        if (wallet?.address) {
          setFromAddress(wallet.address);
        }
      } catch (error) {
        console.error('Error fetching Cosmos wallet:', error);
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
      // It's good practice to pass the chainId to the signer if known/required by your Para setup
      const protoSigner = new ParaProtoSigner(para, WalletType.COSMOS, fromAddress);
      const client = await SigningStargateClient.connectWithSigner(RPC_ENDPOINT, protoSigner);

      const amountInSmallestDenom = {
        denom: DEFAULT_DENOM,
        amount: (parseFloat(amount) * 1_000_000).toString(), // Assuming 6 decimal places for display amount
      };

      const fee: StdFee = {
        amount: [{denom: DEFAULT_DENOM, amount: '5000'}], // Adjusted fee
        gas: DEFAULT_GAS_LIMIT,
      };

      console.log('Signing Cosmos Tx:', {fromAddress, toAddress, amountInSmallestDenom, fee});
      const result = await client.sendTokens(
        fromAddress,
        toAddress,
        [amountInSmallestDenom],
        fee,
        'Sent via Para & CosmJS',
      );
      console.log('Cosmos Tx Result:', result);

      if (result.code !== 0) {
        throw new Error(`Transaction failed with code ${result.code}: ${result.rawLog}`);
      }

      // Alert.alert("Success", `Transaction sent: ${result.transactionHash}`);
      navigation.navigate('Home'); // Navigate back on success
    } catch (error) {
      console.error('Error signing Cosmos transaction:', error);
      // Alert.alert("Error", error instanceof Error ? error.message : "Failed to sign transaction");
      // throw error; // Only re-throw if it needs to be caught удовольствие
    }
  };

  return (
    <TransactionScreen
      type={WalletType.COSMOS}
      title="Send Cosmos Transaction"
      fromAddress={fromAddress}
      amountLabel={`Amount (ATOM)`} // Display unit
      onSign={handleSign}
      onBack={() => navigation.navigate('Home')}
    />
  );
}
