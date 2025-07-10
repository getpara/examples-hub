//
//  EVMWalletUITests.swift
//  ExampleUITests
//
//  Consolidated EVM wallet tests - creates account once for all tests
//

import Foundation
import XCTest

class EVMWalletUITests: XCTestCase {
    // MARK: - Static Properties

    static var app: XCUIApplication!
    static var testEmail: String!
    static var isAccountCreated = false

    // MARK: - Class Setup

    override class func setUp() {
        super.setUp()
        app = XCUIApplication()
        testEmail = TestConstants.generateUniqueEmail()

        // Set up environment
        app.launchEnvironment = [
            "PARA_API_KEY": ProcessInfo.processInfo.environment["PARA_API_KEY"] ?? "",
            "PARA_ENVIRONMENT": "sandbox",
            "RPC_URL": ProcessInfo.processInfo.environment["RPC_URL"] ?? "",
        ]

        Biometrics.enrolled()
        app.launch()

        // Create account once for all tests
        createAccountAndNavigateToEVMWallet()
        isAccountCreated = true
    }

    override class func tearDown() {
        // Logout after all tests
        if isAccountCreated {
            // Navigate back if we're inside a wallet
            if !app.navigationBars["Wallets"].exists {
                app.navigationBars.buttons.element(boundBy: 0).tap()
            }
            app.buttons["logoutButton"].tap()
        }
        super.tearDown()
    }

    // MARK: - Instance Setup

    override func setUp() {
        super.setUp()
        continueAfterFailure = false

        // Ensure we're in the EVM wallet view
        if Self.isAccountCreated, !Self.app.navigationBars["EVM Wallet (Sepolia)"].exists {
            // Navigate back to wallets view if needed
            if !Self.app.navigationBars["Wallets"].exists {
                Self.app.navigationBars.buttons.element(boundBy: 0).tap()
            }
            // Click on first wallet (EVM)
            let firstWalletCell = Self.app.cells.element(boundBy: 0)
            firstWalletCell.tap()
        }
    }

    override func tearDown() {
        // Navigate back to wallets view for next test
        if Self.app.navigationBars["EVM Wallet (Sepolia)"].exists {
            Self.app.navigationBars.buttons.element(boundBy: 0).tap()
        }
        super.tearDown()
    }

    // MARK: - Helper Methods

    private static func createAccountAndNavigateToEVMWallet() {
        // Ensure we start from a logged out state
        TestHelper.ensureLoggedOut(app: app)

        // Perform email authentication with passkey
        TestHelper.performEmailAuthWithPasskey(app: app, email: testEmail)

        // Wait for wallets view
        let walletsView = app.otherElements["walletsView"]
        _ = walletsView.waitForExistence(timeout: TestConstants.longTimeout)

        // Create first EVM wallet
        let createFirstWalletButton = app.buttons["createFirstWalletButton"]
        if createFirstWalletButton.exists {
            createFirstWalletButton.tap()
            let firstWalletCell = app.cells.element(boundBy: 0)
            _ = firstWalletCell.waitForExistence(timeout: TestConstants.longTimeout)
        }

        // Navigate to EVM wallet
        let firstWalletCell = app.cells.element(boundBy: 0)
        firstWalletCell.tap()

        let walletTitle = app.navigationBars["EVM Wallet (Sepolia)"]
        _ = walletTitle.waitForExistence(timeout: TestConstants.defaultTimeout)
    }

    // MARK: - Test Methods

    func testBasicWalletOperations() {
        // Test 1: Copy address
        Self.app.buttons["copyAddressButton"].tap()
        waitForAndDismissAlert(app: Self.app, validateSuccess: true)

        // Test 2: Refresh balance
        let balanceText = Self.app.staticTexts.matching(NSPredicate(format: "label CONTAINS 'ETH'")).firstMatch
        XCTAssertTrue(balanceText.waitForExistence(timeout: TestConstants.longTimeout))
        Self.app.buttons["refreshBalanceButton"].tap()
        // Wait for balance to update instead of sleep
        XCTAssertTrue(balanceText.waitForExistence(timeout: TestConstants.defaultTimeout))

        // Test 3: Check session
        Self.app.buttons["Check Session"].tap()
        let alert = Self.app.alerts.firstMatch
        XCTAssertTrue(alert.waitForExistence(timeout: TestConstants.defaultTimeout))
        XCTAssertTrue(alert.staticTexts["Session Status"].exists)
        alert.buttons["OK"].tap()

        // Test 4: Fetch wallets
        Self.app.buttons["Fetch Wallets"].tap()
        let walletsAlert = Self.app.alerts.firstMatch
        XCTAssertTrue(walletsAlert.waitForExistence(timeout: TestConstants.longTimeout))
        XCTAssertTrue(walletsAlert.staticTexts["Wallets"].exists)
        walletsAlert.buttons["OK"].tap()
    }

    func testSigningOperations() {
        // Test 1: Sign message
        let messageField = Self.app.textFields["Enter a message to sign"]
        messageField.tap()
        messageField.typeText("Hello, blockchain world!")

        Self.app.buttons["Sign Message"].tap()
        waitForAndDismissAlert(app: Self.app, validateSuccess: true)

        // Test 2: Sign transaction
        Self.app.buttons["Sign Transaction"].tap()
        waitForAndDismissAlert(app: Self.app, validateSuccess: true)
    }

    func testWalletRefreshFlow() {
        // Go back to wallets view first
        Self.app.navigationBars.buttons.element(boundBy: 0).tap()

        let refreshButton = Self.app.buttons["refreshButton"]
        let initialWalletCount = Self.app.cells.count

        refreshButton.tap()

        XCTAssertFalse(Self.app.alerts.element.exists, "No error should appear")
        XCTAssertTrue(Self.app.cells.firstMatch.waitForExistence(timeout: TestConstants.defaultTimeout), "Wallets should still exist")
        XCTAssertEqual(Self.app.cells.count, initialWalletCount, "Wallet count should be same")
    }
}
