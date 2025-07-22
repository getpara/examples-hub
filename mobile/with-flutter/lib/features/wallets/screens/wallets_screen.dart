import 'package:flutter/material.dart';
import 'package:para/para.dart';
import '../../../client/para.dart';
import '../widgets/wallet_card.dart';
import 'details/evm_wallet_view.dart';
import 'details/solana_wallet_view.dart';
import 'details/cosmos_wallet_view.dart';

class WalletsScreen extends StatefulWidget {
  final VoidCallback onLogout;

  const WalletsScreen({
    super.key,
    required this.onLogout,
  });

  @override
  State<WalletsScreen> createState() => _WalletsScreenState();
}

class _WalletsScreenState extends State<WalletsScreen> {
  List<Wallet> _wallets = [];
  bool _isLoading = true;
  bool _isRefreshing = false;
  WalletType? _creatingWalletType;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadWallets();
  }

  Future<void> _loadWallets() async {
    try {
      final wallets = await para.fetchWallets();
      if (mounted) {
        setState(() {
          _wallets = wallets;
          _isLoading = false;
          _error = null;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _error = e.toString();
        });
      }
    }
  }

  Future<void> _refreshWallets() async {
    if (_isRefreshing) return;
    
    setState(() => _isRefreshing = true);
    
    try {
      final wallets = await para.fetchWallets();
      if (mounted) {
        setState(() {
          _wallets = wallets;
          _isRefreshing = false;
          _error = null;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isRefreshing = false;
          _error = e.toString();
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Refresh failed: ${e.toString()}')),
        );
      }
    }
  }

  Future<void> _createWallet(WalletType type, StateSetter setModalState) async {
    setState(() => _creatingWalletType = type);
    setModalState(() => _creatingWalletType = type);
    
    try {
      await para.createWallet(type: type, skipDistribute: false);
      await _loadWallets();
      if (mounted) {
        setState(() => _creatingWalletType = null);
        Navigator.of(context).pop();
      }
    } catch (e) {
      if (mounted) {
        setState(() => _creatingWalletType = null);
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Create wallet failed: ${e.toString()}')),
        );
      }
    }
  }

  void _showCreateWalletSheet() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) => SafeArea(
          child: Container(
            padding: const EdgeInsets.all(16),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
              const Text(
                'Select Wallet Type',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  color: Colors.black,
                ),
              ),
              const SizedBox(height: 24),
              ...WalletType.values.map((type) => Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: _creatingWalletType != null 
                      ? null 
                      : () => _createWallet(type, setModalState),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.black,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                    child: _creatingWalletType == type
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                          ),
                        )
                      : Text(
                          type.value,
                          style: const TextStyle(
                            fontWeight: FontWeight.w500,
                            color: Colors.white,
                          ),
                        ),
                  ),
                ),
              )),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _navigateToWalletDetail(Wallet wallet) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) {
          switch (wallet.type) {
            case WalletType.evm:
              return EVMWalletView(wallet: wallet);
            case WalletType.solana:
              return SolanaWalletView(wallet: wallet);
            case WalletType.cosmos:
              return CosmosWalletView(wallet: wallet);
            default:
              return Scaffold(
                appBar: AppBar(title: const Text('Unknown Wallet')),
                body: const Center(child: Text('Unknown wallet type')),
              );
          }
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: const Key('wallets_screen'),
      backgroundColor: const Color(0xFFFBF9F7),
      appBar: AppBar(
        backgroundColor: const Color(0xFFFBF9F7),
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
          icon: Icon(
            _isRefreshing ? Icons.hourglass_empty : Icons.refresh,
            color: Colors.black,
          ),
          onPressed: _isRefreshing ? null : _refreshWallets,
        ),
        title: const Text(
          'Wallets',
          key: ValueKey('wallets_screen_title'),
          style: TextStyle(
            color: Colors.black,
            fontWeight: FontWeight.w600,
          ),
        ),
        actions: [
          TextButton(
            key: const ValueKey('wallets_screen_logout_button'),
            onPressed: widget.onLogout,
            child: const Text(
              'Logout',
              style: TextStyle(color: Colors.black),
            ),
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(
                        Icons.error_outline,
                        size: 48,
                        color: Colors.red,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Error loading wallets',
                        style: TextStyle(
                          fontSize: 16,
                          color: Colors.grey[800],
                        ),
                      ),
                      const SizedBox(height: 8),
                      TextButton(
                        onPressed: _loadWallets,
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _refreshWallets,
                  child: _wallets.isEmpty
                      ? Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              GestureDetector(
                                onTap: _showCreateWalletSheet,
                                child: Container(
                                  width: 250,
                                  height: 200,
                                  padding: const EdgeInsets.all(40),
                                  decoration: BoxDecoration(
                                    color: Colors.blue.withAlpha((255 * 0.1).round()),
                                    borderRadius: BorderRadius.circular(16),
                                  ),
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Icon(
                                        Icons.add_circle,
                                        size: 60,
                                        color: Colors.blue[600],
                                      ),
                                      const SizedBox(height: 16),
                                      const Text(
                                        'Create Your First Wallet',
                                        textAlign: TextAlign.center,
                                        style: TextStyle(
                                          fontSize: 20,
                                          fontWeight: FontWeight.w600,
                                          color: Colors.black,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ),
                        )
                      : ListView.builder(
                          padding: const EdgeInsets.all(16),
                          itemCount: _wallets.length + 1,
                          itemBuilder: (context, index) {
                            if (index == _wallets.length) {
                              return AddWalletCard(
                                onTap: _showCreateWalletSheet,
                              );
                            }
                            
                            final wallet = _wallets[index];
                            return Padding(
                              padding: const EdgeInsets.only(bottom: 12),
                              child: WalletCard(
                                wallet: wallet,
                                onTap: () => _navigateToWalletDetail(wallet),
                              ),
                            );
                          },
                        ),
                ),
    );
  }
}