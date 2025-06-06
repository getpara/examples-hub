import Foundation
import os.log
import ParaSwift

/// Configuration for the Para SDK and related services
struct ParaConfig {
    let environment: ParaEnvironment
    let apiKey: String
    let rpcUrl: String

    private static let logger = Logger(subsystem: "com.para.example", category: "ParaConfig")

    /// Creates a configuration from environment variables
    static func fromEnvironment() -> ParaConfig {
        ParaConfig(
            environment: loadEnvironment(),
            apiKey: loadApiKey(),
            rpcUrl: loadRpcUrl(),
        )
    }

    /// Loads the Para environment from PARA_ENVIRONMENT variable
    private static func loadEnvironment() -> ParaEnvironment {
        let envName = ProcessInfo.processInfo.environment["PARA_ENVIRONMENT"]?.lowercased() ?? "sandbox"

        switch envName {
        case "dev":
            return createDevEnvironment()
        case "sandbox":
            return .sandbox
        case "prod":
            return .prod
        default:
            return .beta
        }
    }

    /// Creates a dev environment with custom configuration if provided
    private static func createDevEnvironment() -> ParaEnvironment {
        let relyingPartyId = ProcessInfo.processInfo.environment["PARA_DEV_RELYING_PARTY_ID"] ?? "dev.usecapsule.com"
        let jsBridgeUrl = ProcessInfo.processInfo.environment["PARA_DEV_JS_BRIDGE_URL"].flatMap { URL(string: $0) }
        return .dev(relyingPartyId: relyingPartyId, jsBridgeUrl: jsBridgeUrl)
    }

    /// Loads the API key from runtime environment or build-time injection
    private static func loadApiKey() -> String {
        // First try runtime environment (works for local development with Xcode schemes)
        if let envApiKey = ProcessInfo.processInfo.environment["PARA_API_KEY"], !envApiKey.isEmpty {
            logger.info("Using API key from runtime environment")
            return envApiKey
        }

        // Fallback to build-time injected value (works for TestFlight builds)
        if let bundleApiKey = Bundle.main.object(forInfoDictionaryKey: "APIKey") as? String, !bundleApiKey.isEmpty {
            logger.info("Using API key from app bundle")
            return bundleApiKey
        }

        fatalError("Missing API key. Set PARA_API_KEY environment variable or ensure build-time injection is configured.")
    }

    /// Loads the RPC URL from PARA_RPC_URL variable or uses default
    private static func loadRpcUrl() -> String {
        ProcessInfo.processInfo.environment["PARA_RPC_URL"] ??
            "https://sepolia.infura.io/v3/961364684c7346c080994baab1469ea8"
    }
}
