import Foundation
import ParaSwift

/// Configuration for the Para SDK
struct ParaConfig {
    let environment: ParaEnvironment
    let apiKey: String

    /// Creates configuration from Info.plist
    /// The values in Info.plist come from:
    /// - Local development: Secrets.xcconfig file
    /// - Xcode Cloud: Environment variables are automatically exposed as build settings
    static func fromEnvironment() -> ParaConfig {
        // Read from Info.plist - this works for both local and Xcode Cloud builds
        guard let apiKey = Bundle.main.object(forInfoDictionaryKey: "PARA_API_KEY") as? String,
              !apiKey.isEmpty,
              apiKey != "YOUR_API_KEY_HERE"
        else {
            fatalError("""
            ParaConfig: No API key found!

            For local development:
            1. Open example/Secrets.xcconfig
            2. Replace YOUR_API_KEY_HERE with your actual API key
            3. Make sure your Xcode project is configured to use Secrets.xcconfig

            For Xcode Cloud:
            Set PARA_API_KEY in your workflow's environment variables
            """)
        }

        // Read environment from Info.plist (defaults to sandbox)
        let environmentString = (Bundle.main.object(forInfoDictionaryKey: "PARA_ENVIRONMENT") as? String) ?? "sandbox"
        let environment = createEnvironment(from: environmentString)

        print("ParaConfig: Loaded configuration (environment: \(environmentString))")

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
                jsBridgeUrl: URL(string: "http://localhost:5173"),
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
