import BigInt
import ParaSwift

enum EVMSigningExamples {
    static let definitions = [
        SigningExampleDefinition(
            id: "evm-message-plain",
            title: "EIP-191 message",
            description: "Signs a UTF-8 message with the standard Ethereum message prefix.",
            operation: .message
        ),
        SigningExampleDefinition(
            id: "evm-message-eip712",
            title: "EIP-712 typed data",
            description: "Signs structured domain, type, and message data.",
            operation: .message
        ),
        SigningExampleDefinition(
            id: "evm-message-eip7702",
            title: "EIP-7702 authorization",
            description: "Signs an account authorization for a provider-managed AA flow.",
            operation: .message
        ),
        SigningExampleDefinition(
            id: "evm-transaction-type0",
            title: "Type 0 legacy transaction",
            description: "Signs a legacy gas-price transaction.",
            operation: .transaction
        ),
        SigningExampleDefinition(
            id: "evm-transaction-type1",
            title: "Type 1 access-list transaction",
            description: "Signs an EIP-2930 transaction with an access list.",
            operation: .transaction
        ),
        SigningExampleDefinition(
            id: "evm-transaction-type2",
            title: "Type 2 dynamic-fee transaction",
            description: "Signs an EIP-1559 transaction with max fee fields.",
            operation: .transaction
        ),
    ]

    static func build(manager: ParaManager, wallet: Wallet) throws -> [SigningExampleAction] {
        let address = try requireWalletValue(wallet.address, named: "EVM address")
        let chainId = 11_155_111

        func signTransaction(_ transaction: EVMTransaction) async throws -> String {
            let result = try await manager.signTransaction(
                walletId: wallet.id,
                transaction: transaction,
                chainId: String(chainId),
                chainType: .evm
            )
            return signingResultDescription(result)
        }

        return [
            SigningExampleAction(definition: definitions[0]) { _ in
                try signingResultDescription(await manager.signMessage(
                    walletId: wallet.id,
                    message: "Sign in to the Para EVM example",
                    chainType: .evm
                ))
            },
            SigningExampleAction(definition: definitions[1]) { _ in
                let message = EVMTypedDataMessage(
                    domain: [
                        "name": .string("Para signing example"),
                        "version": .string("1"),
                        "chainId": .integer(chainId),
                    ],
                    types: ["Example": [EVMTypedDataField(name: "contents", type: "string")]],
                    primaryType: "Example",
                    message: ["contents": .string("Sign this typed message")]
                )
                return try signingResultDescription(await manager.signMessage(
                    walletId: wallet.id,
                    message: message,
                    chainType: .evm
                ))
            },
            SigningExampleAction(definition: definitions[2]) { _ in
                let authorization = try await signAuthorization(manager: manager, wallet: wallet, chainId: chainId)
                return signedAuthorizationDescription(authorization)
            },
            SigningExampleAction(definition: definitions[3]) { _ in
                try await signTransaction(EVMTransaction(
                    to: address,
                    value: 0,
                    gasLimit: 21000,
                    gasPrice: 1_000_000_000,
                    nonce: 0,
                    chainId: BigUInt(chainId),
                    type: 0
                ))
            },
            SigningExampleAction(definition: definitions[4]) { _ in
                try await signTransaction(EVMTransaction(
                    to: address,
                    value: 0,
                    gasLimit: 21000,
                    gasPrice: 1_000_000_000,
                    nonce: 0,
                    chainId: BigUInt(chainId),
                    accessList: [EVMAccessListEntry(address: address, storageKeys: [])],
                    type: 1
                ))
            },
            SigningExampleAction(definition: definitions[5]) { _ in
                try await signTransaction(EVMTransaction(
                    to: address,
                    value: 0,
                    gasLimit: 21000,
                    maxPriorityFeePerGas: 1_000_000_000,
                    maxFeePerGas: 2_000_000_000,
                    nonce: 0,
                    chainId: BigUInt(chainId),
                    type: 2
                ))
            },
        ]
    }

    private static func signAuthorization(
        manager: ParaManager,
        wallet: Wallet,
        chainId: Int
    ) async throws -> EVMSignedAuthorization {
        try await manager.signMessage(
            walletId: wallet.id,
            message: EVMAuthorizationMessage(
                address: "0x0000000000000000000000000000000000007702",
                chainId: chainId,
                nonce: 0
            )
        )
    }

    private static func signedAuthorizationDescription(_ authorization: EVMSignedAuthorization) -> String {
        """
        Signed authorization:
        address: \(authorization.address)
        chainId: \(authorization.chainId)
        nonce: \(authorization.nonce)
        yParity: \(authorization.yParity)
        r: \(authorization.r)
        s: \(authorization.s)
        """
    }
}
