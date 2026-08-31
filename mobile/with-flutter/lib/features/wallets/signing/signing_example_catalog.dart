import 'package:para/para.dart';

import 'cosmos_signing_examples.dart';
import 'evm_signing_examples.dart';
import 'signing_example.dart';
import 'solana_signing_examples.dart';
import 'stellar_signing_examples.dart';
import 'sui_signing_examples.dart';

List<SigningExampleAction> buildSigningExampleCatalog({
  required SigningExampleClient client,
  required Wallet wallet,
}) {
  return switch (wallet.chainType) {
    BridgeChainType.evm =>
      EvmSigningExamples.build(client: client, wallet: wallet),
    BridgeChainType.solana =>
      SolanaSigningExamples.build(client: client, wallet: wallet),
    BridgeChainType.cosmos =>
      CosmosSigningExamples.build(client: client, wallet: wallet),
    BridgeChainType.stellar =>
      StellarSigningExamples.build(client: client, wallet: wallet),
    BridgeChainType.sui =>
      SuiSigningExamples.build(client: client, wallet: wallet),
    null =>
      throw StateError('The wallet does not declare a supported chain type.'),
  };
}
