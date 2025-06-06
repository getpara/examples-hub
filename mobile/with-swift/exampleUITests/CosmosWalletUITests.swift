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
        // Test 1: Sign message (once)
        let messageField = Self.app.textFields["Enter a message to sign"]
        messageField.tap()
        messageField.typeText("Hello Cosmos!")

        Self.app.buttons["Sign Message"].tap()
        waitForAndDismissAlert(app: Self.app, validateSuccess: true)

        // Test 2: Sign transaction with Proto (default)
        Self.app.buttons["Sign Transaction"].tap()
        let protoAlert = Self.app.alerts.firstMatch
        XCTAssertTrue(protoAlert.waitForExistence(timeout: TestConstants.longTimeout), "Alert should appear for proto signing")
        
        // Expect success
        XCTAssertTrue(protoAlert.staticTexts["Success"].exists, "Proto signing should succeed")
        protoAlert.buttons["OK"].tap()

        // Test 3: Switch to Amino and sign transaction
        // Find the segmented control and tap Amino
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
        XCTAssertTrue(aminoAlert.label.contains("AMINO"), "Success message should mention AMINO method")
        aminoAlert.buttons["OK"].tap()
    }
}

