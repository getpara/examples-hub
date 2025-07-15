import 'dart:async';
import 'package:app_links/app_links.dart';
import '../config/deep_link_constants.dart';

/// Service for handling deep links in the Para Flutter example app.
/// 
/// This service uses the app_links package to handle incoming deep links
/// with the custom scheme 'paraflutter://'. It supports:
/// 
/// 1. Authentication callbacks from Para SDK (paraflutter://callback)
/// 2. Wallet connection links (paraflutter://wallet/connect)
/// 3. Custom deep links for app navigation
/// 
/// For production apps, consider using Universal Links (iOS) and
/// App Links (Android) for better security and user experience.
class DeepLinkService {
  static final DeepLinkService _instance = DeepLinkService._internal();
  factory DeepLinkService() => _instance;
  DeepLinkService._internal();

  final _appLinks = AppLinks();
  StreamSubscription<Uri>? _linkSubscription;
  
  // Callback for handling deep links
  void Function(Uri)? _onDeepLinkReceived;
  
  // Initialize deep link handling
  Future<void> initialize({
    required void Function(Uri) onDeepLinkReceived,
  }) async {
    _onDeepLinkReceived = onDeepLinkReceived;
    
    // Handle initial link if app was launched from a deep link
    try {
      final initialLink = await _appLinks.getInitialLink();
      if (initialLink != null) {
        _handleDeepLink(initialLink);
      }
    } catch (e) {
      // Silently ignore initial link errors
    }
    
    // Listen for incoming links while app is running
    _linkSubscription = _appLinks.uriLinkStream.listen(
      _handleDeepLink,
      onError: (_) {
        // Silently ignore deep link errors
      },
    );
  }
  
  void _handleDeepLink(Uri uri) {
    // Check if it's our app's scheme
    if (uri.scheme == DeepLinkConstants.appScheme) {
      _onDeepLinkReceived?.call(uri);
    }
  }
  
  // Clean up resources
  void dispose() {
    _linkSubscription?.cancel();
  }
  
  // Helper method to check if a URL is a Para callback
  static bool isParaCallback(Uri uri) {
    return uri.scheme == DeepLinkConstants.appScheme && 
           (uri.host == DeepLinkConstants.callbackHost || 
            uri.path.contains(DeepLinkConstants.callbackHost));
  }
  
  // Helper method to check if a URL is a wallet connection callback
  static bool isWalletConnectionCallback(Uri uri) {
    return uri.scheme == DeepLinkConstants.appScheme && 
           uri.host == DeepLinkConstants.walletHost && 
           uri.path == DeepLinkConstants.walletConnectPath;
  }
}