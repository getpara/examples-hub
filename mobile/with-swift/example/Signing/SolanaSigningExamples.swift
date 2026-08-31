import Foundation
import ParaSwift

enum SolanaSigningExamples {
    static let definitions = [
        SigningExampleDefinition(
            id: "solana-message-plain",
            title: "Plain message",
            description: "Signs the UTF-8 bytes of a message.",
            operation: .message
        ),
        SigningExampleDefinition(
            id: "solana-message-raw",
            title: "Raw message bytes",
            description: "Signs caller-provided base64 bytes without UTF-8 conversion.",
            operation: .message
        ),
        SigningExampleDefinition(
            id: "solana-transaction-structured",
            title: "Structured legacy transfer",
            description: "Builds a legacy transfer using a recent blockhash from your Solana RPC.",
            operation: .transaction
        ),
        SigningExampleDefinition(
            id: "solana-transaction-legacy",
            title: "Serialized legacy transaction",
            description: "Signs a canonical base64 legacy transaction or message.",
            operation: .transaction
        ),
        SigningExampleDefinition(
            id: "solana-transaction-v0",
            title: "Serialized v0 transaction",
            description: "Signs a canonical base64 versioned transaction or message.",
            operation: .transaction
        ),
    ]

    static func build(manager: ParaManager, wallet: Wallet) throws -> [SigningExampleAction] {
        let address = try requireWalletValue(wallet.address, named: "Solana address")

        return [
            SigningExampleAction(definition: definitions[0]) { _ in
                try signingResultDescription(await manager.signMessage(
                    walletId: wallet.id,
                    message: "Sign in to the Para Solana example",
                    chainType: .solana
                ))
            },
            SigningExampleAction(definition: definitions[1]) { _ in
                let message = RawBridgeMessage.solana(Data("raw Solana bytes".utf8).base64EncodedString())
                return try signingResultDescription(await manager.signMessage(
                    walletId: wallet.id,
                    message: message,
                    chainType: .solana
                ))
            },
            SigningExampleAction(
                definition: definitions[2],
                requiresInput: true,
                inputLabel: "Recent blockhash (base58)"
            ) { input in
                let recentBlockhash = try requireInput(
                    input,
                    label: "Recent blockhash (base58)",
                    for: definitions[2].title
                )
                let transaction = try SolanaTransaction(
                    to: address,
                    lamports: 1,
                    recentBlockhash: recentBlockhash,
                    memo: "Para structured Solana example"
                )
                return try signingResultDescription(await manager.signTransaction(
                    walletId: wallet.id,
                    transaction: transaction,
                    chainType: .solana
                ))
            },
            serializedAction(definition: definitions[3], manager: manager, wallet: wallet),
            serializedAction(definition: definitions[4], manager: manager, wallet: wallet),
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
                transaction: SerializedTransaction.solana(serializedPayload),
                chainType: .solana
            )
            return signingResultDescription(result)
        }
    }
}
