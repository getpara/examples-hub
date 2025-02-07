import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';

class OAuthBrowser extends StatefulWidget {
  final String url;
  final String providerName;
  final String? userAgent;
  final ValueChanged<bool> onBrowserClosed;

  const OAuthBrowser({
    super.key,
    required this.url,
    required this.providerName,
    required this.onBrowserClosed,
    this.userAgent,
  });

  @override
  State<OAuthBrowser> createState() => _OAuthBrowserState();
}

class _OAuthBrowserState extends State<OAuthBrowser> {
  bool _isLoading = true;
  double _progress = 0;
  String? _errorMessage;

  Future<NavigationActionPolicy> _handleNavigationAction(
      InAppWebViewController controller, NavigationAction action) async {
    return NavigationActionPolicy.ALLOW;
  }

  void _handleMainFrameError(InAppWebViewController controller, Uri? uri, int code, String message) {
    setState(() {
      _errorMessage = message;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.9,
      decoration: const BoxDecoration(
        color: Colors.black,
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(16),
          topRight: Radius.circular(16),
        ),
      ),
      child: Column(
        children: [
          AppBar(
            leading: CloseButton(
              onPressed: () {
                widget.onBrowserClosed(true);
                Navigator.of(context).pop();
              },
            ),
            title: Text('Sign In with ${widget.providerName}'),
            backgroundColor: Colors.transparent,
            elevation: 0,
          ),
          Expanded(
            child: ClipRRect(
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(16),
                topRight: Radius.circular(16),
              ),
              child: Stack(
                children: [
                  InAppWebView(
                    initialUrlRequest: URLRequest(url: WebUri(widget.url)),
                    initialSettings: InAppWebViewSettings(
                      javaScriptEnabled: true,
                      mediaPlaybackRequiresUserGesture: false,
                      allowsInlineMediaPlayback: true,
                      useShouldOverrideUrlLoading: true,
                      userAgent: widget.userAgent,
                      mixedContentMode: MixedContentMode.MIXED_CONTENT_ALWAYS_ALLOW,
                      safeBrowsingEnabled: false,
                    ),
                    shouldOverrideUrlLoading: _handleNavigationAction,
                    onLoadStart: (controller, url) {
                      setState(() {
                        _isLoading = true;
                        _errorMessage = null;
                      });
                    },
                    onProgressChanged: (controller, progress) {
                      setState(() {
                        _progress = progress / 100;
                      });
                    },
                    onLoadStop: (controller, url) {
                      setState(() {
                        _isLoading = false;
                      });

                      final currentUrl = url?.toString() ?? '';

                      if ((currentUrl.contains('/auth/') && currentUrl.contains('/callback')) ||
                          RegExp(r'https://api\..*\.usepara\.com/').hasMatch(currentUrl)) {
                        widget.onBrowserClosed(false);
                        if (mounted) {
                          Navigator.of(context).pop();
                        }
                      }
                    },
                    onReceivedError: (controller, request, error) {
                      if (request.isForMainFrame == true) {
                        _handleMainFrameError(
                          controller,
                          request.url,
                          error.type.toNativeValue() ?? -1,
                          error.description,
                        );
                      } else {}
                    },
                  ),
                  if (_progress < 1.0)
                    Positioned(
                      top: 0,
                      left: 0,
                      right: 0,
                      child: ClipRRect(
                        borderRadius: const BorderRadius.only(
                          topLeft: Radius.circular(16),
                          topRight: Radius.circular(16),
                        ),
                        child: SizedBox(
                          height: 4,
                          child: LinearProgressIndicator(
                            value: _progress,
                            backgroundColor: Colors.grey[800],
                            valueColor: AlwaysStoppedAnimation<Color>(
                              Theme.of(context).colorScheme.primary,
                            ),
                          ),
                        ),
                      ),
                    ),
                  if (_isLoading && _progress < 0.1)
                    Container(
                      decoration: const BoxDecoration(
                        color: Colors.black,
                        borderRadius: BorderRadius.only(
                          topLeft: Radius.circular(16),
                          topRight: Radius.circular(16),
                        ),
                      ),
                      child: const Center(
                        child: CircularProgressIndicator(),
                      ),
                    ),
                  if (_errorMessage != null)
                    Container(
                      decoration: const BoxDecoration(
                        color: Colors.black,
                        borderRadius: BorderRadius.only(
                          topLeft: Radius.circular(16),
                          topRight: Radius.circular(16),
                        ),
                      ),
                      padding: const EdgeInsets.all(16),
                      child: Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.error_outline,
                              color: Theme.of(context).colorScheme.error,
                              size: 48,
                            ),
                            const SizedBox(height: 16),
                            Text(
                              'Failed to load page',
                              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                    color: Theme.of(context).colorScheme.error,
                                  ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              _errorMessage!,
                              textAlign: TextAlign.center,
                              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                    color: Theme.of(context).colorScheme.error,
                                  ),
                            ),
                            const SizedBox(height: 16),
                            ElevatedButton.icon(
                              onPressed: () {
                                widget.onBrowserClosed(true);
                                Navigator.of(context).pop();
                              },
                              icon: const Icon(Icons.close),
                              label: const Text('Close'),
                            ),
                          ],
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
