/// Constants for deep link configuration
class DeepLinkConstants {
  // App scheme
  static const String appScheme = 'paraflutter';
  
  // Deep link hosts and paths
  static const String callbackHost = 'callback';
  static const String walletHost = 'wallet';
  static const String walletConnectPath = '/connect';
  
  // External wallet schemes
  static const String metamaskScheme = 'metamask://wc?uri=';
  static const String trustWalletScheme = 'trust://wc?uri=';
  static const String rainbowScheme = 'rainbow://wc?uri=';
  
  // Production configuration notes
  static const String productionNote = '''
For production apps, implement:

iOS:
1. Universal Links with Associated Domains entitlement
2. Host apple-app-site-association file on your domain

Android:
1. App Links with android:autoVerify="true"
2. Host assetlinks.json file on your domain

This provides better security and seamless user experience.
''';
}