import React, {useState} from 'react';
import {SafeAreaView, StyleSheet, View, Alert, ScrollView} from 'react-native';
import {Button, Text} from '@rneui/themed';
import {useNavigation, NavigationProp} from '@react-navigation/native';
import {para} from '../../client/para';
import {OAuthMethod, AuthState} from '@getpara/react-native-wallet';
import {InAppBrowser} from 'react-native-inappbrowser-reborn';
import {Linking} from 'react-native';
import {RootStackParamList} from '../../types';
import {useParaSDK} from '../../providers/ParaProvider';

const APP_SCHEME = 'withreactnative';

export default function OauthAuthScreen() {
  // Use the Para SDK context instead of local initialization state
  const {isInitialized, isInitializing, initError, sdkInfo} = useParaSDK();

  const [isLoading, setIsLoading] = useState(false);
  const [debugLog, setDebugLog] = useState<string>('');
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const addLog = (message: string) => {
    console.log(message);
    setDebugLog(prev => `${prev}\n${message}`);
  };

  // OAuth login handler using the app-wide initialized SDK
  const handleOauthLogin = async (provider: OAuthMethod) => {
    if (!provider) {
      return;
    }

    // Check SDK initialization from the context
    if (!isInitialized) {
      addLog('ERROR: Para SDK not initialized. Please wait for initialization to complete.');
      Alert.alert('Error', 'Para SDK not initialized. Please wait for initialization to complete.');
      return;
    }

    setIsLoading(true);
    setDebugLog('');

    try {
      // Map the provider enum to the string value expected by para
      let providerString: string;

      switch (provider) {
        case OAuthMethod.GOOGLE:
          providerString = 'GOOGLE';
          break;
        case OAuthMethod.APPLE:
          providerString = 'APPLE';
          break;
        case OAuthMethod.DISCORD:
          providerString = 'DISCORD';
          break;
        case OAuthMethod.TWITTER:
          providerString = 'TWITTER';
          break;
        case OAuthMethod.FACEBOOK:
          providerString = 'FACEBOOK';
          break;
        case OAuthMethod.FARCASTER:
        case OAuthMethod.TELEGRAM:
        default:
          Alert.alert('Unsupported', 'This provider is not supported in this demo.');
          setIsLoading(false);
          return;
      }

      addLog(`Starting OAuth flow with provider: ${providerString}`);

      // Try to get the OAuth URL
      const oauthUrl = await para.getOAuthUrl({
        method: providerString as any,
        deeplinkUrl: `${APP_SCHEME}://oauth-callback`,
      });

      if (!oauthUrl) {
        throw new Error('Failed to get OAuth URL');
      }

      addLog(`Got OAuth URL: ${oauthUrl}`);

      // Open browser with the URL
      const isInAppBrowserAvailable = await InAppBrowser.isAvailable();
      let cancelled = false;

      if (isInAppBrowserAvailable) {
        addLog('Opening URL in InAppBrowser');
        const result = await InAppBrowser.openAuth(oauthUrl, APP_SCHEME, {});
        cancelled = result.type !== 'success';
      } else {
        addLog('InAppBrowser not available, using Linking');
        Linking.openURL(oauthUrl);
      }

      if (cancelled) {
        addLog('Browser result was not success');
        throw new Error('User cancelled OAuth flow');
      }

      // Now verify the OAuth result
      addLog('Verifying OAuth result');
      const authStateResponse = await para.verifyOAuth({
        method: providerString as any,
        deeplinkUrl: `${APP_SCHEME}://oauth-callback`,
      });

      if (!authStateResponse) {
        throw new Error('No auth state returned from verifyOAuth');
      }

      addLog(`Got auth state: ${JSON.stringify(authStateResponse)}`);

      // Properly type the authState to avoid linter errors
      const authState = authStateResponse as AuthState;

      // Process based on auth state, similar to email/phone authentication
      if (authState.stage === 'login') {
        addLog('Auth stage: login');

        // Handle login - similar to email/phone examples
        try {
          await para.loginWithPasskey();
          addLog('Login successful');
          navigation.navigate('Home');
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Login failed';
          addLog(`Login error: ${errorMsg}`);
          throw error;
        }
      } else if (authState.stage === 'signup') {
        addLog('Auth stage: signup');

        if (authState.passkeyId) {
          addLog(`Got passkeyId: ${authState.passkeyId}`);

          try {
            // Register passkey like in email/phone examples
            await para.registerPasskey(authState);
            addLog('Passkey registration successful');
            navigation.navigate('Home');
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Failed to register passkey';
            addLog(`Passkey error: ${errorMsg}`);
            throw error;
          }
        } else {
          throw new Error('Missing passkey ID in authentication state');
        }
      } else {
        throw new Error(`Unexpected auth stage: ${authState.stage}`);
      }
    } catch (error) {
      addLog(`Error: ${error}`);

      let errorMessage = 'An unknown error occurred.';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object') {
        errorMessage = String(error);
      }

      Alert.alert('Authentication Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Only include supported providers
  const supportedProviders = [
    OAuthMethod.GOOGLE,
    OAuthMethod.APPLE,
    OAuthMethod.DISCORD,
    OAuthMethod.TWITTER,
    OAuthMethod.FACEBOOK,
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.flexGrow}>
        <View style={styles.headerContainer}>
          <Text h2 h2Style={styles.title}>
            OAuth Authentication Demo
          </Text>
          <Text style={styles.subtitle}>
            Test the Para Auth SDK using OAuth providers. Select one of the authentication methods below.
          </Text>
        </View>

        <View style={styles.container}>
          <View style={styles.debugContainer}>
            <Text style={styles.debugTitle}>SDK Status:</Text>
            <Text style={styles.debugText}>
              {isInitialized
                ? '✓ Para SDK initialized'
                : isInitializing
                ? '⏳ Initializing Para SDK...'
                : '❌ SDK initialization failed'}
              {initError ? `\nError: ${initError}` : ''}
            </Text>
          </View>

          <View style={styles.debugContainer}>
            <Text style={styles.debugTitle}>SDK Information:</Text>
            <Text style={styles.debugText}>
              {Object.entries(sdkInfo)
                .map(([key, value]) => {
                  if (key === 'availableMethods' && Array.isArray(value)) {
                    return `${key}: [${value.length} methods]\n  - ${value.join('\n  - ')}`;
                  }
                  return `${key}: ${JSON.stringify(value)}`;
                })
                .join('\n')}
            </Text>
          </View>

          {supportedProviders.map((provider, index) => (
            <Button
              key={provider}
              title={`Login with ${provider}`}
              onPress={() => handleOauthLogin(provider)}
              disabled={isLoading || !isInitialized}
              loading={isLoading}
              containerStyle={[styles.buttonContainer, index !== supportedProviders.length - 1 && styles.buttonMargin]}
              buttonStyle={styles.button}
              titleStyle={styles.buttonTitle}
            />
          ))}

          {debugLog.length > 0 && (
            <View style={styles.debugContainer}>
              <Text style={styles.debugTitle}>Debug Log:</Text>
              <Text style={styles.debugText}>{debugLog}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  headerContainer: {
    marginBottom: 32,
    paddingHorizontal: 20,
    paddingTop: 24,
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
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 24,
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#fc6c58',
    borderRadius: 8,
    paddingVertical: 14,
  },
  buttonContainer: {
    width: '100%',
  },
  buttonMargin: {
    marginBottom: 16,
  },
  buttonTitle: {
    fontWeight: '600',
    fontSize: 16,
  },
  debugContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  debugTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  debugText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  flexGrow: {flexGrow: 1},
});
