import Foundation
import ParaSwift

enum SigningOperation {
    case message
    case transaction
}

struct SigningExampleDefinition: Identifiable {
    let id: String
    let title: String
    let description: String
    let operation: SigningOperation
}

enum SigningExampleError: LocalizedError {
    case missingWalletValue(String)
    case missingInput(label: String, title: String)

    var errorDescription: String? {
        switch self {
        case let .missingWalletValue(value):
            "The wallet has no \(value)."
        case let .missingInput(label, title):
            "Provide \(label) before signing \(title)."
        }
    }
}

struct SigningExampleAction: Identifiable {
    let definition: SigningExampleDefinition
    let requiresInput: Bool
    let inputLabel: String
    let initialInput: String
    private let operation: (String?) async throws -> String

    var id: String {
        definition.id
    }

    init(
        definition: SigningExampleDefinition,
        requiresInput: Bool = false,
        inputLabel: String = "Canonical base64 payload",
        initialInput: String = "",
        operation: @escaping (String?) async throws -> String
    ) {
        self.definition = definition
        self.requiresInput = requiresInput
        self.inputLabel = inputLabel
        self.initialInput = initialInput
        self.operation = operation
    }

    func sign(input: String?) async throws -> String {
        let resolvedInput = input?.trimmingCharacters(in: .whitespacesAndNewlines)
        if requiresInput, resolvedInput?.isEmpty != false {
            throw SigningExampleError.missingInput(label: inputLabel, title: definition.title)
        }
        return try await operation(resolvedInput)
    }
}

func signingResultDescription(_ result: SignatureResult) -> String {
    [
        "Signed payload:\n\(result.signedTransaction)",
        result.signature.map { "Signature:\n\($0)" },
        result.bytes.map { "Original bytes:\n\($0)" },
        result.signerAddress.map { "Signer address:\n\($0)" },
    ]
    .compactMap { $0 }
    .joined(separator: "\n\n")
}

func requireWalletValue(_ value: String?, named name: String) throws -> String {
    guard let value, !value.isEmpty else {
        throw SigningExampleError.missingWalletValue(name)
    }
    return value
}

func requireInput(_ value: String?, label: String, for title: String) throws -> String {
    guard let value, !value.isEmpty else {
        throw SigningExampleError.missingInput(label: label, title: title)
    }
    return value
}
