import React, {useState, useEffect} from 'react';
import {SafeAreaView, StyleSheet, ScrollView, View} from 'react-native';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {Text} from '@rneui/themed';
import {Wallet, WalletType} from '@getpara/react-native-wallet';
import WalletCard from '../components/WalletCard';
import {para} from '../client/para';
import {RootStackParamList} from '../types';

export default function HomeScreen() {
  const [walletsByType, setWalletsByType] = useState<Record<WalletType, Wallet | null>>({
    [WalletType.EVM]: null,
    [WalletType.SOLANA]: null,
    [WalletType.COSMOS]: null,
  });
  const [loadingCreate, setLoadingCreate] = useState<Record<WalletType, boolean>>({
    [WalletType.EVM]: false,
    [WalletType.SOLANA]: false,
    [WalletType.COSMOS]: false,
  });
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const fetchWallets = () => {
    try {
      const updatedWallets = Object.values(WalletType).reduce((acc, type) => {
        try {
          // Ensure WalletType[type] is a valid key for WalletType
          const walletTypeKey = type as keyof typeof WalletType;
          const wallet = para.getWalletsByType(WalletType[walletTypeKey])[0];
          acc[type] = wallet;
        } catch (error) {
          acc[type] = null;
        }
        return acc;
      }, {} as Record<WalletType, Wallet | null>);
      setWalletsByType(updatedWallets);
    } catch (error) {
      console.error('Error fetching wallets:', error);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const handleSend = (type: WalletType, _address: string) => {
    switch (type) {
      case WalletType.EVM:
        navigation.navigate('SignEVM');
        break;
      case WalletType.COSMOS:
        navigation.navigate('SignCosmos');
        break;
      case WalletType.SOLANA:
        navigation.navigate('SignSolana');
        break;
    }
  };

  const handleCreate = async (type: WalletType) => {
    setLoadingCreate(prev => ({...prev, [type]: true}));
    try {
      await para.createWallet({type, skipDistribute: false});
      await fetchWallets(); // Refetch wallets after creation
    } catch (error) {
      console.error(`Error creating ${type} wallet:`, error);
    } finally {
      setLoadingCreate(prev => ({...prev, [type]: false}));
    }
  };

  const getNetworkName = (type: WalletType): string => {
    switch (type) {
      case WalletType.EVM:
        return 'Ethereum';
      case WalletType.SOLANA:
        return 'Solana';
      case WalletType.COSMOS:
        return 'Cosmos';
      default:
        return 'Unknown';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.headerContainer}>
          <Text h2 h2Style={styles.title}>
            Your Wallets
          </Text>
          <Text style={styles.subtitle}>
            Test all three wallet types in this demo. Each type can be enabled or disabled in your developer portal.
            Create new wallets of any enabled type directly from this interface. Note: Wallet creation requires the
            corresponding wallet types to be enabled in your portal settings.
          </Text>
        </View>
        {Object.entries(walletsByType).map(([type, wallet]) => (
          <WalletCard
            key={type}
            type={type as WalletType}
            // For Cosmos, addressSecondary might be the one to display or use, check SDK docs if unsure.
            // Assuming primary address for general display, specific logic might be needed for Cosmos in WalletCard or here.
            address={wallet?.address}
            networkName={getNetworkName(type as WalletType)}
            onSend={() => wallet?.address && handleSend(type as WalletType, wallet.address)}
            onCreate={() => handleCreate(type as WalletType)}
            hasWallet={!!wallet} // Pass a boolean to indicate if a wallet exists
            isLoadingCreate={loadingCreate[type as WalletType]}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  headerContainer: {
    marginBottom: 32,
  },
  title: {
    color: '#333333',
    textAlign: 'left',
    fontWeight: 'bold',
    fontSize: 32,
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'left',
    fontSize: 16,
    color: '#666666',
    lineHeight: 22,
  },
});
