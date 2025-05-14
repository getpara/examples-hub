import React, {useState, useEffect} from 'react';
import {ethers} from 'ethers';
import {ParaEthersSigner} from '@getpara/ethers-v6-integration';
import {createParaViemClient, createParaAccount} from '@getpara/viem-v2-integration';
import {para} from '../../client/para';
import {WalletType} from '@getpara/react-native-wallet';
import {http, parseEther, parseGwei} from 'viem';
import {sepolia} from 'viem/chains';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import TransactionScreen from '../../components/TransactionScreen';
import {RootStackParamList} from '../../types';

const RPC_URL = 'https://ethereum-sepolia-rpc.publicnode.com';
const signingOptions = [
  {value: 'Ethers', key: 'ethers'},
  {value: 'Viem', key: 'viem'},
];

export default function EVMSendScreen() {
  const [fromAddress, setFromAddress] = useState('');
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  useEffect(() => {
    const initializeAddress = async () => {
      try {
        const wallet = para.getWalletsByType(WalletType.EVM)[0]; // Added await here
        if (wallet?.address) {
          setFromAddress(wallet.address);
        }
      } catch (error) {
        console.error('Error fetching EVM wallet:', error);
      }
    };

    initializeAddress();
  }, []);

  const handleSign = async (toAddress: string, amount: string, signingMethod: string = 'ethers') => {
    try {
      switch (signingMethod) {
        case 'ethers':
          await signWithEthers(toAddress, amount);
          break;
        case 'viem':
          await signWithViem(toAddress, amount);
          break;
        default:
          await signWithEthers(toAddress, amount);
      }
      // Consider adding a success message or navigation reset here
      navigation.navigate('Home'); // Navigate back to Home on successful sign
    } catch (error) {
      console.error('Error signing EVM transaction:', error);
      // Consider showing an alert to the user
      // throw error; // Re-throwing might not be needed if error is handled locally
    }
  };

  const signWithEthers = async (toAddress: string, amount: string) => {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const ethersSigner = new ParaEthersSigner(para, provider);

    const feeData = await provider.getFeeData();

    const transaction = {
      // from: fromAddress, // 'from' is often inferred by the signer
      to: toAddress,
      value: ethers.parseUnits(amount, 'ether'),
      gasLimit: 21000n, // Use BigInt for gasLimit if ethers v6 expects it
      gasPrice: feeData.gasPrice, // Use fetched gasPrice
    };
    console.log('Signing with Ethers:', transaction);
    const signedTx = await ethersSigner.signTransaction(transaction);
    console.log('Ethers signed Tx:', signedTx);
    // const txResponse = await provider.broadcastTransaction(signedTx);
    // console.log("Ethers Tx Response:", txResponse);
    // await txResponse.wait();
  };

  const signWithViem = async (toAddress: string, amount: string) => {
    const viemParaAccount = await createParaAccount(para, WalletType.EVM, fromAddress as `0x${string}`);

    const paraViemSigner = createParaViemClient(para, {
      account: viemParaAccount,
      chain: sepolia,
      transport: http(RPC_URL),
    });

    console.log(`Signing with Viem. From: ${fromAddress}, To: ${toAddress}, Amount: ${amount}`);

    // Fetch nonce and gas price for Viem
    const nonce = await paraViemSigner.getTransactionCount({address: fromAddress as `0x${string}`, blockTag: 'latest'});
    const {maxFeePerGas, maxPriorityFeePerGas} = await paraViemSigner.estimateFeesPerGas();

    const transaction = {
      account: viemParaAccount, // Ensure this is the correct account object
      chain: sepolia,
      to: toAddress as `0x${string}`,
      value: parseEther(amount),
      gas: 21000n, // Use BigInt
      nonce: nonce,
      maxFeePerGas: maxFeePerGas,
      maxPriorityFeePerGas: maxPriorityFeePerGas,
      // gasPrice: parseGwei("1"), // EIP-1559 txs use maxFeePerGas and maxPriorityFeePerGas
    };
    console.log('Signing with Viem:', transaction);
    const signedTx = await paraViemSigner.signTransaction(transaction);
    console.log('Viem signed Tx:', signedTx);
    // const txHash = await paraViemSigner.sendRawTransaction({serializedTransaction: signedTx});
    // console.log("Viem Tx Hash:", txHash);
    // await paraViemSigner.waitForTransactionReceipt({hash: txHash});
  };

  return (
    <TransactionScreen
      type={WalletType.EVM}
      title="Send EVM Transaction"
      fromAddress={fromAddress}
      signingOptions={signingOptions}
      amountLabel="Amount (ETH)"
      defaultSigningMethod="ethers"
      onSign={handleSign}
      onBack={() => navigation.navigate('Home')}
    />
  );
}
