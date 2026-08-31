import 'package:para/para.dart';

enum SigningOperation { message, transaction }

class SigningExampleDefinition {
  final String id;
  final String title;
  final String description;
  final SigningOperation operation;

  const SigningExampleDefinition({
    required this.id,
    required this.title,
    required this.description,
    required this.operation,
  });
}

abstract interface class SigningExampleClient {
  Future<SignatureResult> signMessage({
    required String walletId,
    required Object message,
    BridgeChainType? chainType,
  });

  Future<SignatureResult> signTransaction({
    required String walletId,
    required Object transaction,
    String? chainId,
    BridgeChainType? chainType,
    String? rpcUrl,
  });
}

class ParaSigningExampleClient implements SigningExampleClient {
  final Para para;

  const ParaSigningExampleClient(this.para);

  @override
  Future<SignatureResult> signMessage({
    required String walletId,
    required Object message,
    BridgeChainType? chainType,
  }) async =>
      para.signMessage(
        walletId: walletId,
        message: message,
        chainType: chainType,
      );

  @override
  Future<SignatureResult> signTransaction({
    required String walletId,
    required Object transaction,
    String? chainId,
    BridgeChainType? chainType,
    String? rpcUrl,
  }) async =>
      para.signTransaction(
        walletId: walletId,
        transaction: transaction,
        chainId: chainId,
        chainType: chainType,
        rpcUrl: rpcUrl,
      );
}

typedef SigningExampleCallback = Future<SignatureResult> Function(
    String? input);

class SigningExampleAction {
  final SigningExampleDefinition definition;
  final bool requiresInput;
  final String inputLabel;
  final String? initialInput;
  final SigningExampleCallback _sign;

  const SigningExampleAction({
    required this.definition,
    required SigningExampleCallback sign,
    this.requiresInput = false,
    this.inputLabel = 'Canonical base64 payload',
    this.initialInput,
  }) : _sign = sign;

  Future<SignatureResult> sign({String? input}) {
    final resolvedInput = input ?? initialInput;
    if (requiresInput &&
        (resolvedInput == null || resolvedInput.trim().isEmpty)) {
      throw ArgumentError(
          'Provide $inputLabel before signing ${definition.title}.');
    }
    return _sign(resolvedInput);
  }
}
