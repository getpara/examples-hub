import Foundation
import ParaSwift

enum StellarSigningExamples {
    private static let sorobanAuthorizationPreimage =
        "AAAACc7gMC1ZhE0yvcqRXIID3USzP7t+3BkFHqN6vt8o7NRyAAAAAAAAAAEAAABkAAAAAAAAAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQAAAAVoZWxsbwAAAAAAAAAAAAAA"

    static let definitions = [
        SigningExampleDefinition(
            id: "stellar-message-plain",
            title: "Plain message",
            description: "Signs the UTF-8 bytes of a message.",
            operation: .message
        ),
        SigningExampleDefinition(
            id: "stellar-message-raw",
            title: "Raw message bytes",
            description: "Signs caller-provided base64 bytes without UTF-8 conversion.",
            operation: .message
        ),
        SigningExampleDefinition(
            id: "stellar-message-soroban-auth",
            title: "Soroban authorization entry",
            description: "Signs the canonical XDR authorization-entry preimage.",
            operation: .message
        ),
        SigningExampleDefinition(
            id: "stellar-transaction-payment",
            title: "Structured payment",
            description: "Builds and signs a Stellar payment envelope.",
            operation: .transaction
        ),
        SigningExampleDefinition(
            id: "stellar-transaction-xdr",
            title: "Serialized transaction XDR",
            description: "Adds the Para signature to a standard transaction envelope.",
            operation: .transaction
        ),
        SigningExampleDefinition(
            id: "stellar-transaction-fee-bump-xdr",
            title: "Fee-bump transaction XDR",
            description: "Signs a fee-bump envelope without changing its inner transaction.",
            operation: .transaction
        ),
        SigningExampleDefinition(
            id: "stellar-transaction-soroban-xdr",
            title: "Soroban transaction XDR",
            description: "Signs a serialized Soroban host-function transaction.",
            operation: .transaction
        ),
    ]

    static func build(manager: ParaManager, wallet: Wallet) throws -> [SigningExampleAction] {
        let address = try requireWalletValue(wallet.stellarAddress, named: "Stellar address")

        return [
            SigningExampleAction(definition: definitions[0]) { _ in
                try signingResultDescription(await manager.signMessage(
                    walletId: wallet.id,
                    message: "Sign in to the Para Stellar example",
                    chainType: .stellar
                ))
            },
            SigningExampleAction(definition: definitions[1]) { _ in
                let message = RawBridgeMessage.stellar(Data("raw Stellar bytes".utf8).base64EncodedString())
                return try signingResultDescription(await manager.signMessage(
                    walletId: wallet.id,
                    message: message,
                    chainType: .stellar
                ))
            },
            SigningExampleAction(definition: definitions[2]) { _ in
                let message = StellarAuthEntryMessage(data: sorobanAuthorizationPreimage)
                return try signingResultDescription(await manager.signMessage(
                    walletId: wallet.id,
                    message: message,
                    chainType: .stellar
                ))
            },
            SigningExampleAction(definition: definitions[3]) { _ in
                let transaction = StellarTransaction(
                    to: address,
                    amount: "0.0000001",
                    memo: .text("Para payment example"),
                    networkPassphrase: StellarNetwork.testnetPassphrase,
                    sequenceNumber: "1"
                )
                return try signingResultDescription(await manager.signTransaction(
                    walletId: wallet.id,
                    transaction: transaction,
                    chainType: .stellar
                ))
            },
            serializedAction(definition: definitions[4], manager: manager, wallet: wallet),
            serializedAction(definition: definitions[5], manager: manager, wallet: wallet),
            serializedAction(definition: definitions[6], manager: manager, wallet: wallet),
        ]
    }

    private static func serializedAction(
        definition: SigningExampleDefinition,
        manager: ParaManager,
        wallet: Wallet
    ) -> SigningExampleAction {
        SigningExampleAction(definition: definition, requiresInput: true) { payload in
            let serializedPayload = try requireInput(
                payload,
                label: "Canonical base64 payload",
                for: definition.title
            )
            let result = try await manager.signTransaction(
                walletId: wallet.id,
                transaction: SerializedTransaction.stellar(
                    serializedPayload,
                    networkPassphrase: StellarNetwork.testnetPassphrase
                ),
                chainType: .stellar
            )
            return signingResultDescription(result)
        }
    }
}
