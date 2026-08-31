import ParaSwift
import XCTest

final class SigningExampleCatalogTests: XCTestCase {
    func testPublishesCompleteBridgeSigningMatrix() {
        XCTAssertEqual(EVMSigningExamples.definitions.map(\.id), [
            "evm-message-plain",
            "evm-message-eip712",
            "evm-message-eip7702",
            "evm-transaction-type0",
            "evm-transaction-type1",
            "evm-transaction-type2",
        ])
        XCTAssertEqual(SolanaSigningExamples.definitions.map(\.id), [
            "solana-message-plain",
            "solana-message-raw",
            "solana-transaction-structured",
            "solana-transaction-legacy",
            "solana-transaction-v0",
        ])
        XCTAssertEqual(CosmosSigningExamples.definitions.map(\.id), [
            "cosmos-message-adr036",
            "cosmos-transaction-direct",
            "cosmos-transaction-amino",
            "cosmos-transaction-serialized-direct",
            "cosmos-transaction-serialized-amino",
        ])
        XCTAssertEqual(StellarSigningExamples.definitions.map(\.id), [
            "stellar-message-plain",
            "stellar-message-raw",
            "stellar-message-soroban-auth",
            "stellar-transaction-payment",
            "stellar-transaction-xdr",
            "stellar-transaction-fee-bump-xdr",
            "stellar-transaction-soroban-xdr",
        ])
        XCTAssertEqual(SuiSigningExamples.definitions.map(\.id), [
            "sui-message-plain",
            "sui-message-personal",
            "sui-transaction-bcs",
        ])
    }

    func testEveryExampleHasGuidanceAndAStableAutomationKey() {
        let definitions = EVMSigningExamples.definitions
            + SolanaSigningExamples.definitions
            + CosmosSigningExamples.definitions
            + StellarSigningExamples.definitions
            + SuiSigningExamples.definitions

        XCTAssertEqual(definitions.count, 26)
        XCTAssertEqual(Set(definitions.map(\.id)).count, 26)
        XCTAssertTrue(definitions.allSatisfy { !$0.title.isEmpty && !$0.description.isEmpty })
    }

    @MainActor
    func testCatalogRoutesSuiUsingTheBridgeChainIdentity() throws {
        let manager = ParaManager(environment: .sandbox, apiKey: "test-api-key", appScheme: "para-test")
        let wallet = Wallet(result: [
            "id": "sui-wallet",
            "type": "SUI",
            "addressSui": "0x1111111111111111111111111111111111111111111111111111111111111111",
        ])

        let actions = try buildSigningExampleCatalog(manager: manager, wallet: wallet)

        XCTAssertEqual(actions.map(\.id), SuiSigningExamples.definitions.map(\.id))
    }

    @MainActor
    func testStructuredSolanaExampleRequiresARecentBlockhash() async throws {
        let manager = ParaManager(environment: .sandbox, apiKey: "test-api-key", appScheme: "para-test")
        let wallet = Wallet(result: [
            "id": "solana-wallet",
            "type": "SOLANA",
            "address": "11111111111111111111111111111111",
        ])
        let action = try SolanaSigningExamples
            .build(manager: manager, wallet: wallet)
            .first { $0.id == "solana-transaction-structured" }

        let structuredAction = try XCTUnwrap(action)
        XCTAssertTrue(structuredAction.requiresInput)
        XCTAssertEqual(structuredAction.inputLabel, "Recent blockhash (base58)")
        do {
            _ = try await structuredAction.sign(input: nil)
            XCTFail("Expected the structured Solana example to require a recent blockhash.")
        } catch let error as SigningExampleError {
            XCTAssertEqual(
                error.localizedDescription,
                "Provide Recent blockhash (base58) before signing Structured legacy transfer."
            )
        }
    }
}
