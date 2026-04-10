import { View, Text, TextInput, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';

type IdentifierTab = 'email' | 'phone';

export function IdentifierInput({
  activeTab,
  onTabChange,
  email,
  onEmailChange,
  phone,
  onPhoneChange,
  onSubmit,
  onGoogleLogin,
  onAppleLogin,
}: {
  activeTab: IdentifierTab;
  onTabChange: (tab: IdentifierTab) => void;
  email: string;
  onEmailChange: (text: string) => void;
  phone: string;
  onPhoneChange: (text: string) => void;
  onSubmit: () => void;
  onGoogleLogin: () => void;
  onAppleLogin: () => void;
}) {
  return (
    <View style={styles.form}>
      <View style={styles.tabContainer}>
        <Pressable
          style={[styles.tab, activeTab === 'email' && styles.activeTab]}
          onPress={() => onTabChange('email')}
        >
          <Text style={[styles.tabText, activeTab === 'email' && styles.activeTabText]}>Email</Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'phone' && styles.activeTab]}
          onPress={() => onTabChange('phone')}
        >
          <Text style={[styles.tabText, activeTab === 'phone' && styles.activeTabText]}>Phone</Text>
        </Pressable>
      </View>

      <View style={styles.inputGroup}>
        {activeTab === 'email' ? (
          <TextInput
            style={styles.input}
            placeholder="Email address"
            placeholderTextColor="#A8A29E"
            value={email}
            onChangeText={onEmailChange}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="go"
            onSubmitEditing={onSubmit}
          />
        ) : (
          <TextInput
            style={styles.input}
            placeholder="Phone number (e.g. 15551234567)"
            placeholderTextColor="#A8A29E"
            value={phone}
            onChangeText={onPhoneChange}
            keyboardType="phone-pad"
            returnKeyType="go"
            onSubmitEditing={onSubmit}
          />
        )}

        <Pressable
          style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
          onPress={onSubmit}
        >
          <Text style={styles.primaryButtonText}>Continue</Text>
        </Pressable>
      </View>

      <View style={styles.oauthSection}>
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <Pressable
          style={({ pressed }) => [styles.oauthButton, pressed && styles.oauthButtonPressed]}
          onPress={onGoogleLogin}
        >
          <View style={styles.oauthButtonContent}>
            <AntDesign name="google" size={18} color="#4285F4" />
            <Text style={styles.oauthButtonText}>Continue with Google</Text>
          </View>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.oauthButton, pressed && styles.oauthButtonPressed]}
          onPress={onAppleLogin}
        >
          <View style={styles.oauthButtonContent}>
            <AntDesign name="apple" size={18} color="#1C1917" />
            <Text style={styles.oauthButtonText}>Continue with Apple</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

export function LoadingView({ message }: { message: string }) {
  return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color="#E8642B" />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
}

export function ErrorView({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View style={styles.form}>
      <View style={styles.errorCard}>
        <Text style={styles.errorText}>{message}</Text>
      </View>
      <Pressable
        style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
        onPress={onRetry}
      >
        <Text style={styles.primaryButtonText}>Try Again</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F4',
    borderRadius: 10,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#A8A29E',
  },
  activeTabText: {
    color: '#1C1917',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7E5E4',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1C1917',
  },
  inputGroup: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#E8642B',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonPressed: {
    backgroundColor: '#D45A24',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  oauthSection: {
    gap: 14,
    paddingTop: 4,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E7E5E4',
  },
  dividerText: {
    fontSize: 13,
    color: '#A8A29E',
  },
  oauthButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7E5E4',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  oauthButtonPressed: {
    backgroundColor: '#F5F5F4',
  },
  oauthButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  oauthButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1917',
  },
  centered: {
    alignItems: 'center',
    gap: 16,
    paddingVertical: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#78716C',
  },
  errorCard: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
  },
});
