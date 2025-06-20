import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatusDisplayProps {
  status?: string;
  error?: string;
  success?: string;
}

export const StatusDisplay: React.FC<StatusDisplayProps> = ({ status, error, success }) => {
  if (!status && !error && !success) return null;

  return (
    <View style={[
      styles.container,
      error && styles.errorContainer,
      success && styles.successContainer,
      !error && !success && styles.infoContainer
    ]}>
      <Text style={[
        styles.text,
        error && styles.errorText,
        success && styles.successText,
        !error && !success && styles.infoText
      ]}>
        {error || success || status}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  infoContainer: {
    backgroundColor: '#e3f2fd',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
  },
  successContainer: {
    backgroundColor: '#e8f5e9',
  },
  text: {
    fontSize: 14,
    textAlign: 'center',
  },
  infoText: {
    color: '#1976d2',
  },
  errorText: {
    color: '#c62828',
  },
  successText: {
    color: '#2e7d32',
  },
});