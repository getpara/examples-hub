import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { EmailAuth } from './EmailAuth';
import { PhoneAuth } from './PhoneAuth';
import { OAuthAuth } from './OAuthAuth';

interface AuthSectionProps {
  onSuccess: () => void;
}

export const AuthSection: React.FC<AuthSectionProps> = ({ onSuccess }) => {
  const [showEmailPhone, setShowEmailPhone] = useState(false);
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');

  if (!showEmailPhone) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Para SDK Demo</Text>
        <Text style={styles.subtitle}>Sign in or create an account</Text>
        
        <OAuthAuth onSuccess={onSuccess} />
        
        <TouchableOpacity
          style={styles.emailPhoneLink}
          onPress={() => setShowEmailPhone(true)}
        >
          <Text style={styles.emailPhoneLinkText}>Use email or phone instead</Text>
        </TouchableOpacity>

        <View style={styles.testInfo}>
          <Text style={styles.testTitle}>Test Credentials (BETA only):</Text>
          <Text style={styles.testText}>• Email: any@test.getpara.com</Text>
          <Text style={styles.testText}>• Phone: +1 (425) 555-1234</Text>
          <Text style={styles.testText}>• OTP: Any code works</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Para SDK Demo</Text>
      <Text style={styles.subtitle}>Sign in with email or phone</Text>
      
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, authMethod === 'email' && styles.activeTab]}
          onPress={() => setAuthMethod('email')}
        >
          <Text style={[styles.tabText, authMethod === 'email' && styles.activeTabText]}>
            Email
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, authMethod === 'phone' && styles.activeTab]}
          onPress={() => setAuthMethod('phone')}
        >
          <Text style={[styles.tabText, authMethod === 'phone' && styles.activeTabText]}>
            Phone
          </Text>
        </TouchableOpacity>
      </View>

      {authMethod === 'email' ? (
        <EmailAuth onSuccess={onSuccess} />
      ) : (
        <PhoneAuth onSuccess={onSuccess} />
      )}
      
      <TouchableOpacity
        style={styles.backLink}
        onPress={() => setShowEmailPhone(false)}
      >
        <Text style={styles.backLinkText}>← Back to social login</Text>
      </TouchableOpacity>

      <View style={styles.testInfo}>
        <Text style={styles.testTitle}>Test Credentials (BETA only):</Text>
        <Text style={styles.testText}>• Email: any@test.getpara.com</Text>
        <Text style={styles.testText}>• Phone: +1 (425) 555-1234</Text>
        <Text style={styles.testText}>• OTP: Any code works</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  testInfo: {
    marginTop: 40,
    padding: 16,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
  },
  testTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  testText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  emailPhoneLink: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  emailPhoneLinkText: {
    fontSize: 14,
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  backLink: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  backLinkText: {
    fontSize: 14,
    color: '#007AFF',
  },
});