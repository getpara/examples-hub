import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface SecurityChoiceProps {
  onChoice: (choice: 'passkey' | 'password') => void;
  loading?: boolean;
}

export const SecurityChoice: React.FC<SecurityChoiceProps> = ({
  onChoice,
  loading = false,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Your Security Method</Text>
      <Text style={styles.subtitle}>
        How would you like to secure your wallet?
      </Text>

      <TouchableOpacity
        style={[styles.choiceButton, loading && styles.disabledButton]}
        onPress={() => onChoice('passkey')}
        disabled={loading}
      >
        <Text style={styles.choiceTitle}>Passkey</Text>
        <Text style={styles.choiceDescription}>
          Use biometrics or device authentication for quick, secure access
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.choiceButton, loading && styles.disabledButton]}
        onPress={() => onChoice('password')}
        disabled={loading}
      >
        <Text style={styles.choiceTitle}>Password</Text>
        <Text style={styles.choiceDescription}>
          Traditional password managed on Para&apos;s website
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  choiceButton: {
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  choiceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  choiceDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
});