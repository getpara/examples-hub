import Foundation
import ParaSwift

/// Configuration for the Para SDK
struct ParaConfig {
    let environment: ParaEnvironment
    let apiKey: String
    
    // MARK: - Quick Start Configuration
    // ⚡️ DEVELOPERS: Paste your API key and set your environment here to get started quickly!
    // These values will be used unless overridden by environment variables.
    
    private static let hardcodedApiKey = "" // <- Paste your API key here (e.g., "pk_live_1234...")
    private static let hardcodedEnvironment = "sandbox" // <- Set to: "sandbox", "beta", or "prod"
    
    // MARK: - Configuration Loading
    
    /// Creates configuration using the priority system:
    /// 1. Hard-coded values (if set above)
    /// 2. Environment variables (from Xcode or Xcode Cloud)
    static func fromEnvironment() -> ParaConfig {
        // Determine API key
        let apiKey: String
        
        // Priority 1: Use hard-coded value if provided
        if !hardcodedApiKey.isEmpty {
            apiKey = hardcodedApiKey
            print("ParaConfig: Using hard-coded API key")
        }
        // Priority 2: Check environment variable
        else if let envKey = ProcessInfo.processInfo.environment["PARA_API_KEY"], !envKey.isEmpty {
            apiKey = envKey
            print("ParaConfig: Using API key from environment variable")
        }
        // No API key found
        else {
            fatalError("""
                ParaConfig: No API key found!
                
                To fix this, either:
                1. Add your API key to the hardcodedApiKey variable at the top of ParaConfig.swift
                2. Set the PARA_API_KEY environment variable in your Xcode scheme
                """)
        }
        
        // Determine environment
        let environmentString: String
        
        // Priority 1: Use hard-coded value if provided
        if !hardcodedEnvironment.isEmpty {
            environmentString = hardcodedEnvironment
            print("ParaConfig: Using hard-coded environment '\(environmentString)'")
        }
        // Priority 2: Check environment variable
        else if let envString = ProcessInfo.processInfo.environment["PARA_ENVIRONMENT"], !envString.isEmpty {
            environmentString = envString
            print("ParaConfig: Using environment '\(environmentString)' from environment variable")
        }
        // Default to sandbox
        else {
            environmentString = "sandbox"
            print("ParaConfig: Using default environment 'sandbox'")
        }
        
        // Create ParaEnvironment from string
        let environment = createEnvironment(from: environmentString)
        
        return ParaConfig(apiKey: apiKey, environment: environment)
    }
    
    /// Creates a ParaEnvironment from a string value
    private static func createEnvironment(from string: String) -> ParaEnvironment {
        switch string.lowercased() {
        case "sandbox":
            return .sandbox
        case "beta":
            return .beta
        case "prod", "production":
            return .prod
        case "dev", "development":
            // For dev environment, you can customize the relying party ID and JS bridge URL
            return .dev(
                relyingPartyId: "localhost",
                jsBridgeUrl: URL(string: "http://localhost:5173")
            )
        default:
            print("ParaConfig: Unknown environment '\(string)', defaulting to sandbox")
            return .sandbox
        }
    }
    
    init(apiKey: String, environment: ParaEnvironment) {
        self.apiKey = apiKey
        self.environment = environment
    }
}
