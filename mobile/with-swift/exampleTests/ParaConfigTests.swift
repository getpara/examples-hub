import XCTest

final class ParaConfigTests: XCTestCase {
    func testDevConfigurationPinsTheLocalBridgeAndRelyingParty() throws {
        let config = try ParaConfig(values: [
            "PARA_API_KEY": "local-api-key",
            "PARA_ENVIRONMENT": "dev",
            "PARA_BRIDGE_URL": "http://localhost:5173",
            "PARA_RELYING_PARTY_ID": "localhost",
        ])
        let bridgeURL = try XCTUnwrap(URL(string: "http://localhost:5173"))

        XCTAssertEqual(
            config.environment,
            .dev(relyingPartyId: "localhost", jsBridgeUrl: bridgeURL)
        )
    }

    func testDevConfigurationRejectsMissingLocalRoutingValues() {
        XCTAssertThrowsError(try ParaConfig(values: [
            "PARA_API_KEY": "local-api-key",
            "PARA_ENVIRONMENT": "dev",
        ]))
    }

    func testHostedEnvironmentDoesNotRequireLocalRoutingValues() throws {
        let config = try ParaConfig(values: [
            "PARA_API_KEY": "sandbox-api-key",
            "PARA_ENVIRONMENT": "sandbox",
        ])

        XCTAssertEqual(config.environment.name, "SANDBOX")
    }
}
