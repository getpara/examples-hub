import Foundation
import ParaSwift

/// Configuration for the Para SDK
struct ParaConfig {
    let environment: ParaEnvironment
    let apiKey: String

    init(apiKey: String, environment: ParaEnvironment = .sandbox) {
        // PARA_API_KEY environment variable overrides provided key
        if let envKey = ProcessInfo.processInfo.environment["PARA_API_KEY"], !envKey.isEmpty {
            self.apiKey = envKey
        } else {
            self.apiKey = apiKey
        }

        self.environment = environment
    }
}
