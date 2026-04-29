import Foundation

/// Configuration for the Account Abstraction demo (Alchemy on Sepolia).
///
/// These values are sandbox-only credentials sourced from the external wallet example
/// (`~/para/web-sdk/examples/external-wallet-example/.env.sandbox`). Replace them with
/// your own Alchemy app and gas policy when running against beta or production.
enum AlchemyConfig {
    // Sandbox-only Alchemy credentials — replace for production.
    static let apiKey = "sfcC3PFq6Ma9d6jInNMRs"
    static let gasPolicyId = "06303734-b990-4510-a474-0ab5df919f74"

    /// Sepolia.
    static let chainId = 11_155_111

    /// Burn address used to demonstrate a sponsored zero-value transfer.
    static let burnAddress = "0x000000000000000000000000000000000000dEaD"

    /// Base URL for Sepolia Etherscan, used to link out to mined transactions.
    static let explorerBaseURL = "https://sepolia.etherscan.io"
}
