import 'package:para/para.dart';

import 'signing_example.dart';

abstract final class EvmSigningExamples {
  static const definitions = <SigningExampleDefinition>[
    SigningExampleDefinition(
      id: 'evm-message-plain',
      title: 'EIP-191 message',
      description:
          'Signs a UTF-8 message with the standard Ethereum message prefix.',
      operation: SigningOperation.message,
    ),
    SigningExampleDefinition(
      id: 'evm-message-eip712',
      title: 'EIP-712 typed data',
      description: 'Signs structured domain, type, and message data.',
      operation: SigningOperation.message,
    ),
    SigningExampleDefinition(
      id: 'evm-message-eip7702',
      title: 'EIP-7702 authorization',
      description:
          'Signs an account authorization for a provider-managed AA flow.',
      operation: SigningOperation.message,
    ),
    SigningExampleDefinition(
      id: 'evm-transaction-type0',
      title: 'Type 0 legacy transaction',
      description: 'Signs a legacy gas-price transaction.',
      operation: SigningOperation.transaction,
    ),
    SigningExampleDefinition(
      id: 'evm-transaction-type1',
      title: 'Type 1 access-list transaction',
      description: 'Signs an EIP-2930 transaction with an access list.',
      operation: SigningOperation.transaction,
    ),
    SigningExampleDefinition(
      id: 'evm-transaction-type2',
      title: 'Type 2 dynamic-fee transaction',
      description: 'Signs an EIP-1559 transaction with max fee fields.',
      operation: SigningOperation.transaction,
    ),
  ];

  static List<SigningExampleAction> build({
    required SigningExampleClient client,
    required Wallet wallet,
  }) {
    final walletId = _require(wallet.id, 'wallet ID');
    final address = _require(wallet.address, 'EVM address');
    const chainId = 11155111;

    Future<SignatureResult> signTransaction(EVMTransaction transaction) =>
        client.signTransaction(
          walletId: walletId,
          transaction: transaction,
          chainId: '$chainId',
          chainType: BridgeChainType.evm,
        );

    return [
      SigningExampleAction(
        definition: definitions[0],
        sign: (_) => client.signMessage(
          walletId: walletId,
          message: 'Sign in to the Para EVM example',
          chainType: BridgeChainType.evm,
        ),
      ),
      SigningExampleAction(
        definition: definitions[1],
        sign: (_) => client.signMessage(
          walletId: walletId,
          message: EVMTypedDataMessage(
            domain: const {
              'name': 'Para signing example',
              'version': '1',
              'chainId': chainId,
            },
            types: const {
              'Example': [
                {'name': 'contents', 'type': 'string'},
              ],
            },
            primaryType: 'Example',
            message: const {'contents': 'Sign this typed message'},
          ),
          chainType: BridgeChainType.evm,
        ),
      ),
      SigningExampleAction(
        definition: definitions[2],
        sign: (_) => client.signMessage(
          walletId: walletId,
          message: const EVMAuthorizationMessage(
            address: '0x0000000000000000000000000000000000007702',
            chainId: chainId,
            nonce: 0,
          ),
          chainType: BridgeChainType.evm,
        ),
      ),
      SigningExampleAction(
        definition: definitions[3],
        sign: (_) => signTransaction(EVMTransaction(
          to: address,
          value: '0',
          gasLimit: '21000',
          gasPrice: '1000000000',
          nonce: '0',
          chainId: '$chainId',
          type: 0,
        )),
      ),
      SigningExampleAction(
        definition: definitions[4],
        sign: (_) => signTransaction(EVMTransaction(
          to: address,
          value: '0',
          gasLimit: '21000',
          gasPrice: '1000000000',
          nonce: '0',
          chainId: '$chainId',
          accessList: [
            EVMAccessListEntry(address: address, storageKeys: const [])
          ],
          type: 1,
        )),
      ),
      SigningExampleAction(
        definition: definitions[5],
        sign: (_) => signTransaction(EVMTransaction(
          to: address,
          value: '0',
          gasLimit: '21000',
          maxPriorityFeePerGas: '1000000000',
          maxFeePerGas: '2000000000',
          nonce: '0',
          chainId: '$chainId',
          type: 2,
        )),
      ),
    ];
  }

  static String _require(String? value, String label) {
    if (value == null || value.isEmpty) {
      throw StateError('The wallet has no $label.');
    }
    return value;
  }
}
