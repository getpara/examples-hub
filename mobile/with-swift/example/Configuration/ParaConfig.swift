import Foundation
import ParaSwift

enum ParaConfigError: LocalizedError {
    case missingValue(String)
    case invalidEnvironment(String)
    case invalidURL(String)

    var errorDescription: String? {
        switch self {
        case let .missingValue(name):
            "Set \(name) before launching the example."
        case let .invalidEnvironment(value):
            "Unsupported PARA_ENVIRONMENT value: \(value)."
        case let .invalidURL(value):
            "PARA_BRIDGE_URL is not a valid URL: \(value)."
        }
    }
}

struct ParaConfig {
    let environment: ParaEnvironment
    let apiKey: String

    init(values: [String: String]) throws {
        apiKey = try Self.require(values["PARA_API_KEY"], named: "PARA_API_KEY")
        let environmentName = (values["PARA_ENVIRONMENT"] ?? "sandbox").lowercased()

        switch environmentName {
        case "dev":
            let relyingPartyID = try Self.require(
                values["PARA_RELYING_PARTY_ID"],
                named: "PARA_RELYING_PARTY_ID"
            )
            let bridgeValue = try Self.require(values["PARA_BRIDGE_URL"], named: "PARA_BRIDGE_URL")
            guard let bridgeURL = URL(string: bridgeValue) else {
                throw ParaConfigError.invalidURL(bridgeValue)
            }
            environment = .dev(relyingPartyId: relyingPartyID, jsBridgeUrl: bridgeURL)
        case "sandbox":
            environment = .sandbox
        case "beta":
            environment = .beta
        case "prod":
            environment = .prod
        default:
            throw ParaConfigError.invalidEnvironment(environmentName)
        }
    }

    init(bundle: Bundle = .main) throws {
        let keys = [
            "PARA_API_KEY",
            "PARA_ENVIRONMENT",
            "PARA_BRIDGE_URL",
            "PARA_RELYING_PARTY_ID",
        ]
        var values: [String: String] = Dictionary(uniqueKeysWithValues: keys.compactMap { key in
            guard let value = bundle.object(forInfoDictionaryKey: key) as? String else { return nil }
            return (key, value)
        })
        for key in keys {
            if let value = ProcessInfo.processInfo.environment[key], !value.isEmpty {
                values[key] = value
            }
        }
        try self.init(values: values)
    }

    private static func require(_ value: String?, named name: String) throws -> String {
        guard let value, !value.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
            throw ParaConfigError.missingValue(name)
        }
        return value
    }
}
