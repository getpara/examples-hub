//
//  CosmosWalletUITests.swift
//  ExampleUITests
//
//  Consolidated Cosmos wallet tests - creates account once for all tests
//

import Foundation
import XCTest

class CosmosWalletUITests: XCTestCase {
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

        // Create account and Cosmos wallet once for all tests
        createAccountAndNavigateToCosmosWallet()
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

        // Ensure we're in the Cosmos wallet view
        if Self.isAccountCreated, !Self.app.navigationBars["Cosmos Wallet"].exists {
            // Navigate back to wallets view if needed
            if !Self.app.navigationBars["Wallets"].exists {
                Self.app.navigationBars.buttons.element(boundBy: 0).tap()
            }
            // Make sure we're on Cosmos tab
            Self.app.buttons["Cosmos"].tap()
            // Click on first wallet (Cosmos)
            let firstWalletCell = Self.app.cells.element(boundBy: 0)
            firstWalletCell.tap()
        }
    }

    override func tearDown() {
        // Navigate back to wallets view for next test
        if Self.app.navigationBars["Cosmos Wallet"].exists {
            Self.app.navigationBars.buttons.element(boundBy: 0).tap()
        }
        super.tearDown()
    }

    // MARK: - Helper Methods

    private static func createAccountAndNavigateToCosmosWallet() {
        // Ensure we start from a logged out state
        TestHelper.ensureLoggedOut(app: app)

        // Wait for main screen
        let emailButton = app.buttons["emailAuthButton"]
        XCTAssertTrue(emailButton.waitForExistence(timeout: TestConstants.longTimeout))

        // Start email signup
        emailButton.tap()

        // Enter email
        let emailField = app.textFields["emailInputField"]
        emailField.tap()
        emailField.typeText(testEmail)
        app.buttons["continueButton"].tap()

        // Verify email
        XCTAssertTrue(app.navigationBars["Verify Email"].waitForExistence(timeout: TestConstants.defaultTimeout))
        enterVerificationCode(app: app)
        app.buttons["verifyButton"].tap()

        // Choose passkey
        XCTAssertTrue(app.navigationBars["Secure Your Account"].waitForExistence(timeout: TestConstants.defaultTimeout))
        app.buttons["passkeyButton"].tap()

        // Complete biometric setup
        performBiometricAuthentication(app: app)
        waitForWalletsView(app: app)

        // Switch to Cosmos
        app.buttons["Cosmos"].tap()

        // Create first Cosmos wallet
        let createFirstWalletButton = app.buttons["createFirstWalletButton"]
        XCTAssertTrue(createFirstWalletButton.exists, "Should show create button for Cosmos wallets")
        createFirstWalletButton.tap()

        let firstWalletCell = app.cells.element(boundBy: 0)
        XCTAssertTrue(firstWalletCell.waitForExistence(timeout: TestConstants.longTimeout), "Cosmos wallet should be created")

        // Navigate to Cosmos wallet
        firstWalletCell.tap()

        let walletTitle = app.navigationBars["Cosmos Wallet"]
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

    func testWalletOperations() {
        // Test 1: Verify wallet was created
        XCTAssertTrue(Self.app.navigationBars["Cosmos Wallet"].exists, "Should be in Cosmos wallet view")

        // Test 2: Copy address
        Self.app.buttons["copyAddressButton"].tap()
        waitForAndDismissAlert(app: Self.app, validateSuccess: true)

        // Test 3: Verify Cosmos address format
        let addressTexts = Self.app.staticTexts.matching(NSPredicate(format: "label BEGINSWITH 'cosmos1'"))
        XCTAssertTrue(addressTexts.firstMatch.waitForExistence(timeout: TestConstants.defaultTimeout), "Cosmos address should be displayed")

        // Verify the address format (cosmos1 + valid bech32 length)
        let addressText = addressTexts.firstMatch.label
        XCTAssertTrue(addressText.hasPrefix("cosmos1"), "Address should start with cosmos1")
        XCTAssertTrue(addressText.count >= 39, "Address should be valid bech32 length")
        XCTAssertTrue(addressText.count <= 45, "Address should not be too long")

        // Test 4: Fetch balance
        Self.app.buttons["Fetch Balance"].tap()
        waitForAndDismissAlert(app: Self.app, validateSuccess: true)
    }

    func testSigningFlows() {
        // Test 1: Sign message
        let messageField = Self.app.textFields["Enter a message to sign"]
        messageField.tap()
        messageField.typeText("Hello Cosmos!")

        Self.app.buttons["Sign Message"].tap()
        waitForAndDismissAlert(app: Self.app, validateSuccess: true)

        // Clear message field for next test
        messageField.tap()
        messageField.tap()
        messageField.tap() // Triple tap to select all
        messageField.typeText(XCUIKeyboardKey.delete.rawValue)

        // Test 2: Sign transaction with Proto (default)
        // Scroll to transaction operations section
        let scrollView = Self.app.scrollViews.firstMatch
        scrollView.swipeUp()

        Self.app.buttons["Sign Transaction"].tap()
        let protoAlert = Self.app.alerts.firstMatch
        XCTAssertTrue(protoAlert.waitForExistence(timeout: TestConstants.longTimeout), "Alert should appear for proto signing")

        // Expect success with chain info
        XCTAssertTrue(protoAlert.staticTexts["Success"].exists, "Proto signing should succeed")
        protoAlert.buttons["OK"].tap()

        // Test 3: Switch to Amino and sign transaction
        let aminoButton = Self.app.buttons["Amino (Legacy)"]
        XCTAssertTrue(aminoButton.exists, "Amino button should exist in picker")
        aminoButton.tap()

        // Wait a moment for UI to update
        Thread.sleep(forTimeInterval: 0.5)

        // Sign transaction with Amino
        Self.app.buttons["Sign Transaction"].tap()
        let aminoAlert = Self.app.alerts.firstMatch
        XCTAssertTrue(aminoAlert.waitForExistence(timeout: TestConstants.longTimeout), "Alert should appear for amino signing")

        // Expect success
        XCTAssertTrue(aminoAlert.staticTexts["Success"].exists, "Amino signing should succeed")
        aminoAlert.buttons["OK"].tap()
    }

    func testChainConfiguration() {
        // Test switching between preset chains
        let scrollView = Self.app.scrollViews.firstMatch

        // Scroll to chain configuration
        scrollView.swipeUp()

        // Test 1: Verify default chain (Cosmos Hub)
        let chainInfo = Self.app.staticTexts.matching(identifier: "Current Chain: Cosmos Hub (cosmos1...)")
        XCTAssertTrue(chainInfo.count > 0 || Self.app.staticTexts["Current Chain: Cosmos Hub (cosmos1...)"].exists,
                      "Should show Cosmos Hub as default chain")

        // Test 2: Switch to Osmosis
        let chainPicker = Self.app.buttons["chainPicker"]
        XCTAssertTrue(chainPicker.exists, "Chain picker should exist")
        chainPicker.tap()

        let osmosisOption = Self.app.buttons["Osmosis"]
        XCTAssertTrue(osmosisOption.waitForExistence(timeout: TestConstants.defaultTimeout))
        osmosisOption.tap()

        // Wait for re-initialization
        Thread.sleep(forTimeInterval: 2.0)

        // Verify address changed to osmo prefix
        let osmoAddressTexts = Self.app.staticTexts.matching(NSPredicate(format: "label BEGINSWITH 'osmo1'"))
        XCTAssertTrue(osmoAddressTexts.firstMatch.waitForExistence(timeout: TestConstants.defaultTimeout),
                      "Address should update to osmo1 prefix")

        // Test 3: Test custom configuration
        let customToggle = Self.app.switches["customConfigToggle"]
        XCTAssertTrue(customToggle.exists, "Custom config toggle should exist")
        customToggle.tap()

        // Enter custom chain details
        let chainIdField = Self.app.textFields["e.g., cosmoshub-4"]
        XCTAssertTrue(chainIdField.waitForExistence(timeout: TestConstants.defaultTimeout))
        chainIdField.tap()
        chainIdField.typeText("test-chain-1")

        let prefixField = Self.app.textFields["e.g., cosmos"]
        prefixField.tap()
        prefixField.typeText("test")

        // Apply configuration
        Self.app.buttons["Apply Configuration"].tap()

        // Wait for re-initialization
        Thread.sleep(forTimeInterval: 2.0)

        // Verify custom prefix in address
        let testAddressTexts = Self.app.staticTexts.matching(NSPredicate(format: "label BEGINSWITH 'test1'"))
        XCTAssertTrue(testAddressTexts.firstMatch.waitForExistence(timeout: TestConstants.defaultTimeout),
                      "Address should update to test1 prefix")

        // Test 4: Switch back to preset chain
        customToggle.tap()
        Thread.sleep(forTimeInterval: 2.0)

        // Verify we're back to default Cosmos Hub
        let cosmosAddressTexts = Self.app.staticTexts.matching(NSPredicate(format: "label BEGINSWITH 'cosmos1'"))
        XCTAssertTrue(cosmosAddressTexts.firstMatch.waitForExistence(timeout: TestConstants.defaultTimeout),
                      "Address should revert to cosmos1 prefix")
    }

    func testChainSpecificTransactions() {
        // Scroll to chain configuration
        let scrollView = Self.app.scrollViews.firstMatch
        scrollView.swipeUp()

        // Test signing on different chains
        let chainPicker = Self.app.buttons["chainPicker"]
        XCTAssertTrue(chainPicker.exists, "Chain picker should exist")
        chainPicker.tap()
        Self.app.buttons["Juno"].tap()
        Thread.sleep(forTimeInterval: 2.0)

        // Verify Juno address
        let junoAddressTexts = Self.app.staticTexts.matching(NSPredicate(format: "label BEGINSWITH 'juno1'"))
        XCTAssertTrue(junoAddressTexts.firstMatch.waitForExistence(timeout: TestConstants.defaultTimeout),
                      "Should show juno1 address")

        // Sign transaction on Juno
        Self.app.buttons["Sign Transaction"].tap()
        let junoAlert = Self.app.alerts.firstMatch
        XCTAssertTrue(junoAlert.waitForExistence(timeout: TestConstants.longTimeout))
        XCTAssertTrue(junoAlert.label.contains("Juno"), "Success message should mention Juno chain")
        junoAlert.buttons["OK"].tap()

        // Test 2: Sign on Stargaze
        chainPicker.tap()
        Self.app.buttons["Stargaze"].tap()
        Thread.sleep(forTimeInterval: 2.0)

        // Verify Stargaze address
        let starsAddressTexts = Self.app.staticTexts.matching(NSPredicate(format: "label BEGINSWITH 'stars1'"))
        XCTAssertTrue(starsAddressTexts.firstMatch.waitForExistence(timeout: TestConstants.defaultTimeout),
                      "Should show stars1 address")

        // Sign transaction on Stargaze
        Self.app.buttons["Sign Transaction"].tap()
        let starsAlert = Self.app.alerts.firstMatch
        XCTAssertTrue(starsAlert.waitForExistence(timeout: TestConstants.longTimeout))
        XCTAssertTrue(starsAlert.label.contains("Stargaze"), "Success message should mention Stargaze chain")
        starsAlert.buttons["OK"].tap()
    }

    func testWalletManagement() {
        // Scroll to wallet management section
        let scrollView = Self.app.scrollViews.firstMatch
        scrollView.swipeUp()
        scrollView.swipeUp()

        // Test 1: Check session
        Self.app.buttons["checkSessionButton"].tap()
        let sessionAlert = Self.app.alerts.firstMatch
        XCTAssertTrue(sessionAlert.waitForExistence(timeout: TestConstants.defaultTimeout))

        // Be more lenient with session check - just verify we got a response
        let hasSessionStatus = sessionAlert.label.contains("Session Active:") || sessionAlert.staticTexts["Session Status"].exists
        XCTAssertTrue(hasSessionStatus, "Should show session status (active or inactive)")
        sessionAlert.buttons["OK"].tap()

        // Test 2: Fetch wallets
        Self.app.buttons["fetchWalletsButton"].tap()
        let walletsAlert = Self.app.alerts.firstMatch
        XCTAssertTrue(walletsAlert.waitForExistence(timeout: TestConstants.defaultTimeout))
        XCTAssertTrue(walletsAlert.staticTexts["Wallets"].exists, "Should show wallets")
        walletsAlert.buttons["OK"].tap()
    }
}
