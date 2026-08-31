import ParaSwift

func buildSigningExampleCatalog(manager: ParaManager, wallet: Wallet) throws -> [SigningExampleAction] {
    switch wallet.chainType {
    case .evm:
        try EVMSigningExamples.build(manager: manager, wallet: wallet)
    case .solana:
        try SolanaSigningExamples.build(manager: manager, wallet: wallet)
    case .cosmos:
        try CosmosSigningExamples.build(manager: manager, wallet: wallet)
    case .stellar:
        try StellarSigningExamples.build(manager: manager, wallet: wallet)
    case .sui:
        SuiSigningExamples.build(manager: manager, wallet: wallet)
    case .none:
        throw SigningExampleError.missingWalletValue("supported chain type")
    }
}
