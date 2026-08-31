import ParaSwift

enum CosmosSigningExamples {
    static let definitions = [
        SigningExampleDefinition(
            id: "cosmos-message-adr036",
            title: "ADR-036 message",
            description: "Signs a plain message using the Cosmos ADR-036 sign document.",
            operation: .message
        ),
        SigningExampleDefinition(
            id: "cosmos-transaction-direct",
            title: "Structured Direct transaction",
            description: "Builds and signs a protobuf SIGN_MODE_DIRECT transfer.",
            operation: .transaction
        ),
        SigningExampleDefinition(
            id: "cosmos-transaction-amino",
            title: "Structured Amino transaction",
            description: "Builds and signs a legacy Amino JSON transfer.",
            operation: .transaction
        ),
        SigningExampleDefinition(
            id: "cosmos-transaction-serialized-direct",
            title: "Serialized Direct SignDoc",
            description: "Signs canonical protobuf SignDoc bytes supplied as base64.",
            operation: .transaction
        ),
        SigningExampleDefinition(
            id: "cosmos-transaction-serialized-amino",
            title: "Serialized Amino sign document",
            description: "Signs a canonical Amino JSON sign document supplied as base64.",
            operation: .transaction
        ),
    ]

    static func build(manager: ParaManager, wallet: Wallet) throws -> [SigningExampleAction] {
        let address = try requireWalletValue(wallet.addressSecondary ?? wallet.address, named: "Cosmos address")
        let chainId = "provider"

        return [
            SigningExampleAction(definition: definitions[0]) { _ in
                try signingResultDescription(await manager.signMessage(
                    walletId: wallet.id,
                    message: "Sign in to the Para Cosmos example",
                    chainType: .cosmos
                ))
            },
            structuredAction(
                definition: definitions[1],
                format: "proto",
                memo: "Para Direct example",
                manager: manager,
                wallet: wallet,
                address: address,
                chainId: chainId
            ),
            structuredAction(
                definition: definitions[2],
                format: "amino",
                memo: "Para Amino example",
                manager: manager,
                wallet: wallet,
                address: address,
                chainId: chainId
            ),
            serializedAction(
                definition: definitions[3],
                mode: .direct,
                manager: manager,
                wallet: wallet
            ),
            serializedAction(
                definition: definitions[4],
                mode: .amino,
                manager: manager,
                wallet: wallet
            ),
        ]
    }

    private static func structuredAction(
        definition: SigningExampleDefinition,
        format: String,
        memo: String,
        manager: ParaManager,
        wallet: Wallet,
        address: String,
        chainId: String
    ) -> SigningExampleAction {
        SigningExampleAction(definition: definition) { _ in
            let transaction = CosmosTransaction(
                to: address,
                amount: "1",
                denom: "uatom",
                memo: memo,
                gasLimit: "200000",
                gasPrice: "5000",
                sequence: 0,
                accountNumber: 0,
                chainId: chainId,
                format: format
            )
            return try signingResultDescription(await manager.signTransaction(
                walletId: wallet.id,
                transaction: transaction,
                chainId: chainId,
                chainType: .cosmos
            ))
        }
    }

    private static func serializedAction(
        definition: SigningExampleDefinition,
        mode: CosmosSignMode,
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
                transaction: SerializedTransaction.cosmos(serializedPayload, signMode: mode),
                chainType: .cosmos
            )
            return signingResultDescription(result)
        }
    }
}
