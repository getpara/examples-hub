//
//  SolanaWalletUITests.swift
//  ExampleUITests
//
//  Consolidated Solana wallet tests - creates account once for all tests
//

import Foundation
import XCTest

class SolanaWalletUITests: XCTestCase {
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

        // Create account and Solana wallet once for all tests
        createAccountAndNavigateToSolanaWallet()
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

        // Ensure we're in the Solana wallet view
        if Self.isAccountCreated, !Self.app.navigationBars["Solana Wallet"].exists {
            // Navigate back to wallets view if needed
            if !Self.app.navigationBars["Wallets"].exists {
                Self.app.navigationBars.buttons.element(boundBy: 0).tap()
            }
            // Make sure we're on Solana tab
            Self.app.buttons["Solana"].tap()
            // Click on first wallet (Solana)
            let firstWalletCell = Self.app.cells.element(boundBy: 0)
            firstWalletCell.tap()
        }
    }

    override func tearDown() {
        // Navigate back to wallets view for next test
        if Self.app.navigationBars["Solana Wallet"].exists {
            Self.app.navigationBars.buttons.element(boundBy: 0).tap()
        }
        super.tearDown()
    }

    // MARK: - Helper Methods

    private static func createAccountAndNavigateToSolanaWallet() {
        // Ensure we start from a logged out state
        TestHelper.ensureLoggedOut(app: app)

        // Perform email authentication with passkey
        TestHelper.performEmailAuthWithPasskey(app: app, email: testEmail)

        // Wait for wallets view
        let walletsView = app.otherElements["walletsView"]
        XCTAssertTrue(walletsView.waitForExistence(timeout: TestConstants.longTimeout))

        // Switch to Solana
        app.buttons["Solana"].tap()

        // Create first Solana wallet
        let createFirstWalletButton = app.buttons["createFirstWalletButton"]
        XCTAssertTrue(createFirstWalletButton.exists, "Should show create button for Solana wallets")
        createFirstWalletButton.tap()

        let firstWalletCell = app.cells.element(boundBy: 0)
        XCTAssertTrue(firstWalletCell.waitForExistence(timeout: TestConstants.longTimeout), "Solana wallet should be created")

        // Navigate to Solana wallet
        firstWalletCell.tap()

        let walletTitle = app.navigationBars["Solana Wallet"]
        XCTAssertTrue(walletTitle.waitForExistence(timeout: TestConstants.defaultTimeout))
    }

    private static func enterVerificationCode(app: XCUIApplication) {
        let codeInput = app.textFields["verificationCodeField"]
        XCTAssertTrue(codeInput.waitForExistence(timeout: TestConstants.defaultTimeout))
        codeInput.tap()
        codeInput.typeText(TestConstants.verificationCode)
    }

    private static func performBiometricAuthentication(app: XCUIApplication) {
        let window = app.windows.firstMatch
        let screenWidth = window.frame.size.width
        let screenHeight = window.frame.size.height

        let normalizedX = (screenWidth / 2) / screenWidth
        let normalizedY = (screenHeight - 100) / screenHeight

        let tapCoordinate = window.coordinate(withNormalizedOffset: CGVector(dx: normalizedX, dy: normalizedY))
        sleep(5)
        tapCoordinate.tap()
        sleep(2)
        Biometrics.successfulAuthentication()
        sleep(1)
    }

    private static func waitForWalletsView(app: XCUIApplication) {
        let walletsView = app.otherElements["walletsView"]
        XCTAssertTrue(walletsView.waitForExistence(timeout: TestConstants.longTimeout))
    }

    // MARK: - Test Methods

    func testWalletBasicOperations() {
        // Test 1: Verify wallet was created (already done in setup)
        XCTAssertTrue(Self.app.navigationBars["Solana Wallet"].exists, "Should be in Solana wallet view")

        // Test 2: Copy address
        Self.app.buttons["copyAddressButton"].tap()
        waitForAndDismissAlert(app: Self.app, validateSuccess: true)

        // Test 3: Verify Solana address format
        let addressTexts = Self.app.staticTexts.matching(NSPredicate(format: "label MATCHES '^[1-9A-HJ-NP-Za-km-z]{32,44}$'"))
        XCTAssertTrue(addressTexts.firstMatch.waitForExistence(timeout: TestConstants.defaultTimeout), "Valid Solana address should be displayed")
    }

    func testSigningOperations() {
        // Test 1: Sign message
        let messageField = Self.app.textFields["Enter a message to sign"]
        messageField.tap()
        messageField.typeText("Hello Solana!")

        Self.app.buttons["Sign Message"].tap()
        waitForAndDismissAlert(app: Self.app, validateSuccess: true)

        // Test 2: Sign transaction
        Self.app.buttons["Sign Transaction"].tap()
        waitForAndDismissAlert(app: Self.app, validateSuccess: true)
    }
}
