import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:para_flutter/client/para.dart';
import 'package:solana_web3/programs.dart';
import 'package:solana_web3/solana_web3.dart';

class DemoPhantom extends StatefulWidget {
  const DemoPhantom({super.key});

  @override
  State<DemoPhantom> createState() => DemoPhantomState();
}

class DemoPhantomState extends State<DemoPhantom> {
  @override
  void initState() {
    super.initState();
  }

  Future<void> _copyAddress(String address) async {
    await Clipboard.setData(ClipboardData(text: address));
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Address copied to clipboard')),
    );
  }

  Future<void> _signTransaction() async {
    final cluster = Cluster.mainnet;
    final connection = Connection(cluster);

    final BlockhashWithExpiryBlockHeight blockhash =
        await connection.getLatestBlockhash();

    final transaction = Transaction.v0(
        payer:
            Pubkey.fromBase58("Ez9MDm59vRftZS63KSbTdM4ujUEwftRC3wkRmMxu5XWz"),
        recentBlockhash: blockhash.blockhash,
        instructions: [
          SystemProgram.transfer(
            fromPubkey: Pubkey.fromBase58(
                "Ez9MDm59vRftZS63KSbTdM4ujUEwftRC3wkRmMxu5XWz"),
            toPubkey: Pubkey.fromBase58(
                "HVMgc1okoZ1fzkpSAABoirViU83rqNRnVcEisjtgdNZC"),
            lamports: solToLamports(0.5),
          ),
        ]);

    final signedTransaction =
        await phantomConnector.signTransaction(transaction);
  }

  void _signMessage() {
    phantomConnector
        .signMessage("Message to sign! Hello World")
        .then((onValue) => {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Message signed: $onValue'),
                ),
              )
            });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Phantom Wallet'),
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
                onPressed: _signTransaction,
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size.fromHeight(50),
                ),
                child: const Text('Sign Transaction'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
