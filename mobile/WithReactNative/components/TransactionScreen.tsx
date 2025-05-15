import React, {useState} from 'react';
import {SafeAreaView, ScrollView, View, StyleSheet} from 'react-native';
import {Text, Input, Button} from '@rneui/themed';
import {SelectList} from 'react-native-dropdown-select-list';
import {WalletType} from '@getpara/react-native-wallet';

interface SigningOption {
  key: string;
  value: string;
}

interface TransactionScreenProps {
  type: WalletType;
  title: string;
  fromAddress: string;
  signingOptions?: SigningOption[];
  amountLabel: string;
  defaultSigningMethod?: string;
  onSign: (toAddress: string, amount: string, signingMethod?: string) => Promise<void>;
  onBack: () => void;
}

export default function TransactionScreen({
  type,
  title,
  fromAddress,
  signingOptions,
  amountLabel,
  defaultSigningMethod,
  onSign,
  onBack,
}: TransactionScreenProps) {
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [signingMethod, setSigningMethod] = useState(defaultSigningMethod);
  const [signature, _setSignature] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSend = async () => {
    try {
      setIsProcessing(true);
      await onSign(toAddress, amount, signingMethod);
    } catch (error) {
      console.error(`Error signing ${type} transaction:`, error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <Text h2 h2Style={styles.title}>
          {title}
        </Text>

        <Input
          label="From Address"
          value={fromAddress}
          disabled
          containerStyle={styles.inputContainer}
          inputContainerStyle={styles.input}
          labelStyle={styles.inputLabel}
        />

        <Input
          label="To Address"
          value={toAddress}
          onChangeText={setToAddress}
          placeholder="Enter recipient address"
          containerStyle={styles.inputContainer}
          inputContainerStyle={styles.input}
          labelStyle={styles.inputLabel}
        />

        <Input
          label={amountLabel}
          value={amount}
          onChangeText={setAmount}
          placeholder="Enter amount to send"
          keyboardType="numeric"
          containerStyle={styles.inputContainer}
          inputContainerStyle={styles.input}
          labelStyle={styles.inputLabel}
        />

        {signingOptions && signingOptions.length > 0 && (
          <SelectList
            setSelected={setSigningMethod}
            data={signingOptions}
            defaultOption={signingOptions.find(option => option.key === defaultSigningMethod)}
            save="value"
            search={false}
            boxStyles={styles.dropdown}
          />
        )}

        <Button
          title="Sign Transaction"
          onPress={handleSend}
          disabled={!toAddress || !amount || isProcessing}
          loading={isProcessing}
          buttonStyle={styles.signButton}
          containerStyle={styles.signButtonContainer}
        />

        {signature && (
          <View style={styles.signatureContainer}>
            <Text style={styles.signatureTitle}>Signature:</Text>
            <Text style={styles.signatureText}>{signature}</Text>
          </View>
        )}

        <Button
          title="Back to Home"
          onPress={onBack}
          type="outline"
          containerStyle={styles.signButtonContainer}
          buttonStyle={styles.backButton}
          titleStyle={styles.backButtonTitle}
          disabled={isProcessing}
        />
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
  title: {
    color: '#333333',
    textAlign: 'left',
    fontWeight: 'bold',
    fontSize: 32,
    marginBottom: 16,
  },
  inputContainer: {
    paddingHorizontal: 0,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  inputLabel: {
    color: '#333333',
    fontSize: 14,
    marginBottom: 4,
  },
  dropdown: {
    marginBottom: 16,
    borderColor: '#86939e',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  signButtonContainer: {
    width: '100%',
    marginVertical: 8,
  },
  signButton: {
    backgroundColor: '#fc6c58',
    borderRadius: 8,
    paddingVertical: 12,
  },
  backButton: {
    borderColor: '#fc6c58',
    borderWidth: 1,
    borderRadius: 8,
  },
  backButtonTitle: {
    color: '#fc6c58',
  },
  signatureContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  signatureTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333333',
  },
  signatureText: {
    color: '#666666',
  },
});
