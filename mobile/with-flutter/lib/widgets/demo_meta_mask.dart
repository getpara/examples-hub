import 'package:flutter/material.dart';
import 'package:para_flutter/client/para.dart';
import 'package:web3dart/web3dart.dart';

class DemoMetaMask extends StatefulWidget {
  const DemoMetaMask({super.key});

  @override
  State<DemoMetaMask> createState() => DemoMetaMaskState();
}

class DemoMetaMaskState extends State<DemoMetaMask> {
  @override
  void initState() {
    super.initState();
  }

  void _sendTransaction() {
    final transaction = Transaction(
      from: EthereumAddress.fromHex(metamaskConnector.accounts.first),
      to: EthereumAddress.fromHex('0x13158486860B81Dee9e43Dd0391e61c2F82B577F'),
      value: EtherAmount.inWei(BigInt.from(10000000000000000)),
      maxGas: 100000,
      gasPrice: EtherAmount.inWei(BigInt.from(1000000000)),
    );

    metamaskConnector.sendTransaction(transaction, metamaskConnector.accounts.first).then((onValue) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Transaction signed: $onValue'),
        ),
      );
    });
  }

  void _signMessage() {
    metamaskConnector.signMessage("Message to sign! Hello World", metamaskConnector.accounts.first).then((onValue) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Message signed: $onValue'),
        ),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Meta Mask Wallet'),
        centerTitle: true,
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(24),
              child: ElevatedButton(
                onPressed: _signMessage,
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size.fromHeight(50),
                ),
                child: const Text('Sign Message'),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(24),
              child: ElevatedButton(
                onPressed: _sendTransaction,
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size.fromHeight(50),
                ),
                child: const Text('Send Transaction'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
