import Foundation
import ParaSwift

/// Configuration for the Para SDK and related services
struct ParaConfig {
    let environment: ParaEnvironment
    let apiKey: String
    let rpcUrl: String
    
    /// Creates a configuration from environment variables
    static func fromEnvironment() -> ParaConfig {
        ParaConfig(
            environment: loadEnvironment(),
            apiKey: loadApiKey(),
            rpcUrl: loadRpcUrl()
        )
    }
    
    /// Loads the Para environment from PARA_ENVIRONMENT variable
    private static func loadEnvironment() -> ParaEnvironment {
        let envName = ProcessInfo.processInfo.environment["PARA_ENVIRONMENT"]?.lowercased() ?? "beta"
        
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
    
    /// Loads the API key from PARA_API_KEY variable
    private static func loadApiKey() -> String {
        guard let apiKey = ProcessInfo.processInfo.environment["PARA_API_KEY"], !apiKey.isEmpty else {
            fatalError("Missing required environment variable: PARA_API_KEY")
        }
        return apiKey
    }
    
    /// Loads the RPC URL from PARA_RPC_URL variable or uses default
    private static func loadRpcUrl() -> String {
        ProcessInfo.processInfo.environment["PARA_RPC_URL"] ?? 
            "https://sepolia.infura.io/v3/961364684c7346c080994baab1469ea8"
    }
}
