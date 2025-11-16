//
//  EVMWalletUITests.swift
//  ExampleUITests
//

import Foundation
import XCTest

final class EVMWalletUITests: XCTestCase {
    private var app: XCUIApplication!
    private let testEmail = "evmtesting@test.getpara.com"

    // MARK: - Lifecycle

    override func setUpWithError() throws {
        try super.setUpWithError()
        continueAfterFailure = false

        app = XCUIApplication()

        Biometrics.enrolled()
        app.launch()

        ensureLoggedOut(app: app)
        performOneClickAuthentication(app: app, credential: testEmail)

        XCTAssertTrue(
            app.otherElements["walletsView"].waitForExistence(timeout: TestConstants.longTimeout),
            "Wallet list should be visible after signing in."
        )
    }

    override func tearDownWithError() throws {
        if app?.state == .runningForeground {
            app.terminate()
        }
        app = nil
        try super.tearDownWithError()
    }

    // MARK: - Tests

    func testBasicWalletOperations() {
        openEvmWallet()

        app.buttons["copyAddressButton"].tap()
        dismissAlert(titled: "Success")

        let balanceButton = app.buttons["refreshBalanceButton"]
        if balanceButton.waitForExistence(timeout: TestConstants.defaultTimeout) {
            balanceButton.tap()
        } else if app.buttons["Fetch Balance"].waitForExistence(timeout: TestConstants.defaultTimeout) {
            app.buttons["Fetch Balance"].tap()
        }
    }

    func testSigningOperations() {
        openEvmWallet()

        let messageField = app.textFields["Enter a message to sign"]
        XCTAssertTrue(messageField.waitForExistence(timeout: TestConstants.defaultTimeout))
        messageField.tap()
        messageField.typeText("Hello from UITests")

        app.buttons["Sign Message (EIP-191)"].tap()
        dismissAlert(titled: "Message Signed")

        app.buttons["Sign Transaction"].tap()
        dismissAlert(titled: "Transaction Signed")
    }

    func testWalletRefreshFlow() {
        ensureEvmWalletExists()

        let refreshButton = app.buttons["refreshButton"]
        XCTAssertTrue(refreshButton.waitForExistence(timeout: TestConstants.defaultTimeout))

        let walletCards = app.buttons.matching(identifier: "walletCell_EVM")
        let initialCount = walletCards.count
        XCTAssertGreaterThan(initialCount, 0, "Expected to see at least one EVM wallet before refreshing.")

        refreshButton.tap()

        XCTAssertTrue(walletCards.firstMatch.waitForExistence(timeout: TestConstants.defaultTimeout))
        XCTAssertEqual(walletCards.count, initialCount, "Refreshing should not change the number of wallets.")
    }

    // MARK: - Helpers

    private func openEvmWallet() {
        ensureEvmWalletExists()

        let walletCard = app.buttons.matching(identifier: "walletCell_EVM").firstMatch
        XCTAssertTrue(walletCard.waitForExistence(timeout: TestConstants.defaultTimeout), "An EVM wallet card should be present.")
        walletCard.tap()

        XCTAssertTrue(
            app.buttons["copyAddressButton"].waitForExistence(timeout: TestConstants.defaultTimeout),
            "EVM wallet details should be visible."
        )
    }

    private func ensureEvmWalletExists() {
        let existingWallet = app.buttons.matching(identifier: "walletCell_EVM").firstMatch
        if existingWallet.waitForExistence(timeout: 2) {
            return
        }

        if app.buttons["createFirstWalletButton"].waitForExistence(timeout: 1) {
            app.buttons["createFirstWalletButton"].tap()
        } else if app.buttons["addWalletButton"].waitForExistence(timeout: 1) {
            app.buttons["addWalletButton"].tap()
        }

        if app.buttons["evmWalletButton"].waitForExistence(timeout: TestConstants.defaultTimeout) {
            app.buttons["evmWalletButton"].tap()
        }

        if app.buttons["createWalletButton"].waitForExistence(timeout: TestConstants.defaultTimeout) {
            app.buttons["createWalletButton"].tap()
        }

        if app.buttons["confirmCreateWalletButton"].waitForExistence(timeout: TestConstants.defaultTimeout) {
            app.buttons["confirmCreateWalletButton"].tap()
        }

        XCTAssertTrue(
            app.buttons.matching(identifier: "walletCell_EVM").firstMatch.waitForExistence(timeout: TestConstants.longTimeout),
            "Newly created EVM wallet should appear in the list."
        )
    }

    private func dismissAlert(titled expectedTitle: String) {
        let alert = app.alerts.firstMatch
        XCTAssertTrue(alert.waitForExistence(timeout: TestConstants.longTimeout), "Expected an alert titled \(expectedTitle).")
        XCTAssertTrue(alert.staticTexts[expectedTitle].exists, "Alert should display title \(expectedTitle).")
        alert.buttons["OK"].tap()
    }
}
