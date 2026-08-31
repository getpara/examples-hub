import Foundation
import ParaSwift

enum SuiSigningExamples {
    static let definitions = [
        SigningExampleDefinition(
            id: "sui-message-plain",
            title: "Plain personal message",
            description: "Signs UTF-8 text with the Sui personal-message intent.",
            operation: .message
        ),
        SigningExampleDefinition(
            id: "sui-message-personal",
            title: "Personal message bytes",
            description: "Signs caller-provided base64 bytes with the Sui personal-message intent.",
            operation: .message
        ),
        SigningExampleDefinition(
            id: "sui-transaction-bcs",
            title: "Serialized BCS transaction",
            description: "Signs canonical base64 BCS transaction bytes with the Sui transaction intent.",
            operation: .transaction
        ),
    ]

    private static let sampleTransaction =
        "AAABAAgBAAAAAAAAAAECAAEBAAAREREREREREREREREREREREREREREREREREREREREREQEiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIgEAAAAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEREREREREREREREREREREREREREREREREREREREREREBAAAAAAAAAEBCDwAAAAAAAA=="

    static func build(manager: ParaManager, wallet: Wallet) -> [SigningExampleAction] {
        [
            SigningExampleAction(definition: definitions[0]) { _ in
                try signingResultDescription(await manager.signMessage(
                    walletId: wallet.id,
                    message: "Sign in to the Para Sui example",
                    chainType: .sui
                ))
            },
            SigningExampleAction(definition: definitions[1]) { _ in
                let message = SuiPersonalMessage(
                    data: Data("Sui personal-message bytes".utf8).base64EncodedString()
                )
                return try signingResultDescription(await manager.signMessage(
                    walletId: wallet.id,
                    message: message,
                    chainType: .sui
                ))
            },
            SigningExampleAction(
                definition: definitions[2],
                requiresInput: true,
                initialInput: sampleTransaction
            ) { payload in
                let serializedPayload = try requireInput(
                    payload,
                    label: "Canonical base64 payload",
                    for: definitions[2].title
                )
                return try signingResultDescription(await manager.signTransaction(
                    walletId: wallet.id,
                    transaction: SerializedTransaction.sui(serializedPayload),
                    chainType: .sui
                ))
            },
        ]
    }
}
