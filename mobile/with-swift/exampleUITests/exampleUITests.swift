//
//  ExampleUITests.swift
//  ExampleUITests
//
//  Created by Tyson Williams on 3/10/25.
//

import XCTest
import Foundation
import Darwin

class ExampleUITests: XCTestCase {
    // MARK: - Properties
    let app = XCUIApplication()
    
    // MARK: - Test Constants
    private enum TestConstants {
        static let emailDomain = "test.usecapsule.com"
        static let verificationCode = "123456"
        static let defaultTimeout: TimeInterval = 5.0
        static let longTimeout: TimeInterval = 30.0
        
        // For sequential tests that need saved data
        static var savedEmail: String?
        static var savedPhoneNumber: String?
        
        static func generateTestPhoneNumber() -> String {
            let lastFour = String(format: "%04d", Int.random(in: 0...9999))
            return "408555\(lastFour)"
        }
        
        static func generateUniqueEmail() -> String {
            let timestamp = Int(Date().timeIntervalSince1970)
            return "test+\(String(format: "%010x", timestamp))@\(emailDomain)"
        }
    }
    
    // MARK: - Setup & Teardown
    override func setUpWithError() throws {
        // Put setup code here. This method is called before the invocation of each test method in the class.
        continueAfterFailure = false
        
        // Debug environment variables
        print("=== UI TEST ENVIRONMENT DEBUG ===")
        let paraApiKey = ProcessInfo.processInfo.environment["PARA_API_KEY"] ?? ""
        let paraEnvironment = ProcessInfo.processInfo.environment["PARA_ENVIRONMENT"] ?? "sandbox"
        let rpcUrl = ProcessInfo.processInfo.environment["RPC_URL"] ?? ""
        
        print("PARA_API_KEY length: \(paraApiKey.count)")
        print("PARA_API_KEY (first 8 chars): \(String(paraApiKey.prefix(8)))...")
        print("PARA_ENVIRONMENT: \(paraEnvironment)")
        print("RPC_URL: \(rpcUrl)")
        print("=================================")
        
        // Set up environment variables for testing
        app.launchEnvironment = [
            "PARA_API_KEY": paraApiKey,
            "PARA_ENVIRONMENT": paraEnvironment,
            "RPC_URL": rpcUrl
        ]
        
        Biometrics.enrolled()
        
        print("=== LAUNCHING APP ===")
        app.launch()
        print("=== APP LAUNCHED ===")
        
        // Wait for the main screen to appear after launch
        waitForMainScreen()
    }
    
    // MARK: - Helper Methods
    private func waitForMainScreen() {
        let emailButton = app.buttons["emailAuthButton"]
        XCTAssertTrue(emailButton.waitForExistence(timeout: TestConstants.longTimeout), "Main screen should appear")
    }
    
    private func performBiometricAuthentication() {
        // For signup/account creation
        performBiometricAuthenticationWithOffsetFromBottom(100)
    }
    
    private func performBiometricAuthenticationForLogin() {
        // For login - button appears higher from bottom
        performBiometricAuthenticationWithOffsetFromBottom(50)
    }
    
    private func performBiometricAuthenticationWithOffsetFromBottom(_ offsetFromBottom: CGFloat) {
        let window = app.windows.firstMatch
        let screenWidth = window.frame.size.width
        let screenHeight = window.frame.size.height
        
        let normalizedX = (screenWidth / 2) / screenWidth
        let normalizedY = (screenHeight - offsetFromBottom) / screenHeight
        
        let tapCoordinate = window.coordinate(withNormalizedOffset: CGVector(dx: normalizedX, dy: normalizedY))
        sleep(7)
        tapCoordinate.tap()
        sleep(2)
        Biometrics.successfulAuthentication()
        sleep(1)
    }
    
    private func tapNotNowOnPasswordModal() {
        sleep(3)
        let window = app.windows.firstMatch
        let tapCoordinate = window.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.92))
        tapCoordinate.tap()
        sleep(1)
    }
    
    private func enterVerificationCode() {
        let codeInput = app.textFields["verificationCodeField"]
        XCTAssertTrue(codeInput.waitForExistence(timeout: TestConstants.defaultTimeout), "Verification code field should exist")
        codeInput.tap()
        codeInput.typeText(TestConstants.verificationCode)
    }
    
    private func waitForWalletsView() {
        let walletsView = app.otherElements["walletsView"]
        XCTAssertTrue(walletsView.waitForExistence(timeout: TestConstants.longTimeout), "Wallets view should appear")
        
        let firstWalletCell = app.cells.element(boundBy: 0)
        XCTAssertTrue(firstWalletCell.waitForExistence(timeout: TestConstants.defaultTimeout), "First wallet should exist")
    }
    
    /// Creates a fresh account with passkey for independent testing
    private func createAccountWithPasskey() {
        // Start email signup
        app.buttons["emailAuthButton"].tap()
        
        // Enter unique email
        let emailField = app.textFields["emailInputField"]
        emailField.tap()
        emailField.typeText(TestConstants.generateUniqueEmail())
        app.buttons["continueButton"].tap()
        
        // Verify email
        XCTAssertTrue(app.navigationBars["Verify Email"].waitForExistence(timeout: TestConstants.defaultTimeout))
        enterVerificationCode()
        app.buttons["verifyButton"].tap()
        
        // Choose passkey
        XCTAssertTrue(app.navigationBars["Secure Your Account"].waitForExistence(timeout: TestConstants.defaultTimeout))
        app.buttons["passkeyButton"].tap()
        
        // Complete biometric setup
        performBiometricAuthentication()
        waitForWalletsView()
    }
    
    private func navigateToEVMWallet() {
        let firstWalletCell = app.cells.element(boundBy: 0)
        firstWalletCell.tap()
        
        let walletTitle = app.navigationBars["EVM Wallet (Sepolia)"]
        XCTAssertTrue(walletTitle.waitForExistence(timeout: TestConstants.defaultTimeout), "EVM wallet should open")
    }
    
    private func createSolanaWallet() {
        app.buttons["Solana"].tap()
        app.buttons["createWalletButton"].tap()
        app.buttons["solanaWalletButton"].tap()
        
        let firstWalletCell = app.cells.element(boundBy: 0)
        XCTAssertTrue(firstWalletCell.waitForExistence(timeout: TestConstants.longTimeout), "Solana wallet should be created")
    }
    
    private func navigateToSolanaWallet() {
        createSolanaWallet()
        
        let firstWalletCell = app.cells.element(boundBy: 0)
        firstWalletCell.tap()
        
        let walletTitle = app.navigationBars["Solana Wallet"]
        XCTAssertTrue(walletTitle.waitForExistence(timeout: TestConstants.defaultTimeout), "Solana wallet should open")
    }
    
    // MARK: - Test Methods
    
    // MARK: - Authentication Tests (test01-test02)
    func test01EmailPasskeyCompleteFlow() throws {
        // PART 1: SIGNUP
        app.buttons["emailAuthButton"].tap()
        
        let uniqueEmail = TestConstants.generateUniqueEmail()
        TestConstants.savedEmail = uniqueEmail
        
        let emailField = app.textFields["emailInputField"]
        emailField.tap()
        emailField.typeText(uniqueEmail)
        app.buttons["continueButton"].tap()
        
        XCTAssertTrue(app.navigationBars["Verify Email"].waitForExistence(timeout: TestConstants.defaultTimeout))
        enterVerificationCode()
        app.buttons["verifyButton"].tap()
        
        XCTAssertTrue(app.navigationBars["Secure Your Account"].waitForExistence(timeout: TestConstants.defaultTimeout))
        app.buttons["passkeyButton"].tap()
        
        performBiometricAuthentication()
        waitForWalletsView()
        
        // PART 2: TEST LOGIN
        app.buttons["logoutButton"].tap()
        XCTAssertTrue(app.buttons["emailAuthButton"].waitForExistence(timeout: TestConstants.longTimeout))
        
        app.buttons["emailAuthButton"].tap()
        let emailFieldAgain = app.textFields["emailInputField"]
        emailFieldAgain.tap()
        emailFieldAgain.typeText(uniqueEmail)
        app.buttons["continueButton"].tap()

        performBiometricAuthenticationForLogin()
        waitForWalletsView()
    }
    
    func test02PhonePasskeyCompleteFlow() throws {
        // PART 1: SIGNUP
        app.buttons["phoneAuthButton"].tap()
        
        let phoneNumber = TestConstants.generateTestPhoneNumber()
        TestConstants.savedPhoneNumber = phoneNumber
        
        let phoneField = app.textFields["phoneNumberField"]
        phoneField.tap()
        phoneField.typeText(phoneNumber)
        app.buttons["continueButton"].tap()
        
        XCTAssertTrue(app.navigationBars["Verify Phone"].waitForExistence(timeout: TestConstants.defaultTimeout))
        enterVerificationCode()
        app.buttons["verifyButton"].tap()
        
        XCTAssertTrue(app.navigationBars["Secure Your Account"].waitForExistence(timeout: TestConstants.defaultTimeout))
        app.buttons["passkeyButton"].tap()
        
        performBiometricAuthentication()
        waitForWalletsView()
        
        // PART 2: TEST LOGIN
        app.buttons["logoutButton"].tap()
        XCTAssertTrue(app.buttons["phoneAuthButton"].waitForExistence(timeout: TestConstants.longTimeout))
        
        app.buttons["phoneAuthButton"].tap()
        let phoneFieldAgain = app.textFields["phoneNumberField"]
        phoneFieldAgain.tap()
        phoneFieldAgain.typeText(phoneNumber)
        app.buttons["continueButton"].tap()
        
        performBiometricAuthenticationForLogin()
        waitForWalletsView()
    }
    
    // MARK: - Wallet Operations Tests (test03-test11)
    func test03WalletRefreshFlow() throws {
        createAccountWithPasskey()
        
        let refreshButton = app.buttons["refreshButton"]
        let initialWalletCount = app.cells.count
        
        refreshButton.tap()
        
        XCTAssertFalse(app.alerts.element.exists, "No error should appear")
        XCTAssertTrue(app.cells.firstMatch.waitForExistence(timeout: TestConstants.defaultTimeout), "Wallets should still exist")
        XCTAssertEqual(app.cells.count, initialWalletCount, "Wallet count should be same")
    }
    
    func test04CreateWalletFlow() throws {
        createAccountWithPasskey()
        
        app.buttons["createWalletButton"].tap()
        app.buttons["evmWalletButton"].tap()
        
        let secondWallet = app.cells.element(boundBy: 1)
        XCTAssertTrue(secondWallet.waitForExistence(timeout: TestConstants.longTimeout), "New wallet should be created")
    }
    
    func test05CopyWalletAddressFlow() throws {
        createAccountWithPasskey()
        navigateToEVMWallet()
        
        app.buttons["copyAddressButton"].tap()
        
        let alert = app.alerts.firstMatch
        XCTAssertTrue(alert.waitForExistence(timeout: TestConstants.defaultTimeout), "Success alert should appear")
        XCTAssertTrue(alert.staticTexts["Success"].exists, "Should show success")
        alert.buttons["OK"].tap()
    }
    
    func test06FetchBalanceFlow() throws {
        createAccountWithPasskey()
        navigateToEVMWallet()
        
        let balanceText = app.staticTexts.matching(NSPredicate(format: "label CONTAINS 'ETH'")).firstMatch
        XCTAssertTrue(balanceText.waitForExistence(timeout: TestConstants.longTimeout), "Balance should appear")
        
        app.buttons["refreshBalanceButton"].tap()
        sleep(2)
        
        XCTAssertTrue(balanceText.exists, "Balance should remain visible")
    }
    
    func test07SignMessageFlow() throws {
        createAccountWithPasskey()
        navigateToEVMWallet()
        
        let messageField = app.textFields["Enter a message to sign"]
        messageField.tap()
        messageField.typeText("Hello, blockchain world!")
        
        app.buttons["Sign Message"].tap()
        
        let alert = app.alerts.firstMatch
        XCTAssertTrue(alert.waitForExistence(timeout: TestConstants.longTimeout), "Alert should appear")
        XCTAssertTrue(alert.staticTexts["Success"].exists, "Should succeed")
        alert.buttons["OK"].tap()
    }
    
    func test08SignTransactionFlow() throws {
        createAccountWithPasskey()
        navigateToEVMWallet()
        
        app.buttons["Sign Transaction"].tap()
        
        let alert = app.alerts.firstMatch
        XCTAssertTrue(alert.waitForExistence(timeout: TestConstants.longTimeout), "Alert should appear")
        XCTAssertTrue(alert.staticTexts["Success"].exists, "Should succeed")
        alert.buttons["OK"].tap()
    }
    
    func test09CheckSessionFlow() throws {
        createAccountWithPasskey()
        navigateToEVMWallet()
        
        app.buttons["Check Session"].tap()
        
        let alert = app.alerts.firstMatch
        XCTAssertTrue(alert.waitForExistence(timeout: TestConstants.defaultTimeout), "Alert should appear")
        XCTAssertTrue(alert.staticTexts["Session Status"].exists, "Should show session status")
        alert.buttons["OK"].tap()
    }
    
    func test10FetchWalletsFlow() throws {
        createAccountWithPasskey()
        navigateToEVMWallet()
        
        app.buttons["Fetch Wallets"].tap()
        
        let alert = app.alerts.firstMatch
        XCTAssertTrue(alert.waitForExistence(timeout: TestConstants.longTimeout), "Alert should appear")
        XCTAssertTrue(alert.staticTexts["Wallets"].exists, "Should show wallets info")
        alert.buttons["OK"].tap()
    }
    
    func test11LogoutFlow() throws {
        createAccountWithPasskey()
        navigateToEVMWallet()
        
        app.buttons["Logout"].tap()
        
        XCTAssertTrue(app.buttons["emailAuthButton"].waitForExistence(timeout: TestConstants.longTimeout), "Should return to login")
        XCTAssertTrue(app.buttons["phoneAuthButton"].exists, "Both login options should be available")
    }
    
    // MARK: - Password Authentication Test (test12)
    func test12EmailPasswordCompleteFlow() throws {
        // Start email authentication
        let emailButton = app.buttons["emailAuthButton"]
        XCTAssertTrue(emailButton.exists)
        emailButton.tap()
        
        // Enter email and save it
        let timestamp = Int(Date().timeIntervalSince1970)
        let uniqueEmail = "test\(timestamp)@\(TestConstants.emailDomain)"
        TestConstants.savedEmail = uniqueEmail // Save for login test
        
        let emailField = app.textFields["emailInputField"]
        emailField.tap()
        emailField.typeText(uniqueEmail)
        app.buttons["continueButton"].tap()
        
        // Verify email verification view
        let verifyNavBar = app.navigationBars["Verify Email"]
        XCTAssertTrue(verifyNavBar.waitForExistence(timeout: TestConstants.defaultTimeout), "Verify Email view should appear")
        
        // Enter verification code
        enterVerificationCode()
        
        // Complete verification
        let verifyButton = app.buttons["verifyButton"]
        XCTAssertTrue(verifyButton.waitForExistence(timeout: TestConstants.defaultTimeout), "Verify button should exist")
        verifyButton.tap()
        
        // Choose Password on ChooseSignupMethodView
        let chooseMethodNavBar = app.navigationBars["Secure Your Account"]
        XCTAssertTrue(chooseMethodNavBar.waitForExistence(timeout: TestConstants.defaultTimeout), "Secure Your Account view should appear")
        
        // Find and tap the password button
        let createPasswordButton = app.buttons["passwordButton"]
        XCTAssertTrue(createPasswordButton.waitForExistence(timeout: TestConstants.defaultTimeout), "Password button should exist")
        createPasswordButton.tap()
        
        sleep(2)
        
        // Try to tap "Continue" if the system dialog appears
        let springboard = XCUIApplication(bundleIdentifier: "com.apple.springboard")
        let continueButton = springboard.buttons["Continue"]
        if continueButton.waitForExistence(timeout: TestConstants.defaultTimeout) {
            continueButton.tap()
        }
        
        let webView = app.webViews.firstMatch
        XCTAssertTrue(webView.waitForExistence(timeout: TestConstants.longTimeout), "Password creation web view should appear")
        
        // Set a valid password (8+ chars, no spaces)
        let passwordToSet = "ParaTestPassword"
        
        // Find password fields using the exact placeholders
        let passwordField = webView.secureTextFields["Enter password"]
        XCTAssertTrue(passwordField.waitForExistence(timeout: TestConstants.defaultTimeout), "Password field should exist")
        
        let confirmPasswordField = webView.secureTextFields["Confirm password"]
        XCTAssertTrue(confirmPasswordField.waitForExistence(timeout: TestConstants.defaultTimeout), "Confirm password field should exist")
        
        // Tap top password field
        passwordField.tap()
        // Handle the iOS password manager modal by tapping "Not Now"
        tapNotNowOnPasswordModal()
        
        // Enter password
        passwordField.tap()
        passwordField.typeText(passwordToSet)
        
        // Enter same password in confirmation field
        confirmPasswordField.tap()
        confirmPasswordField.typeText(passwordToSet)
        
        // Find and tap the Save Password button
        let savePasswordButton = webView.buttons["Save Password"]
        savePasswordButton.tap()
        
        // Verify successful authentication by waiting for the wallets view
        waitForWalletsView()
        
        // Logout to test login flow
        let logoutButton = app.buttons["logoutButton"]
        XCTAssertTrue(logoutButton.waitForExistence(timeout: TestConstants.defaultTimeout), "Logout button should exist")
        logoutButton.tap()
        
        // Verify we return to the authentication screen
        let emailButtonAgain = app.buttons["emailAuthButton"]
        XCTAssertTrue(emailButtonAgain.waitForExistence(timeout: TestConstants.longTimeout), "Email auth button should appear after logout")
        
        // PART 2: LOGIN WITH PASSWORD
        // Start email authentication again
        emailButtonAgain.tap()
        
        let emailFieldAgain = app.textFields["emailInputField"]
        emailFieldAgain.tap()
        emailFieldAgain.typeText(uniqueEmail) // Use the same email
        app.buttons["continueButton"].tap()
        
        // Try to tap "Continue" if the system dialog appears
        let springboard2 = XCUIApplication(bundleIdentifier: "com.apple.springboard")
        let continueButton2 = springboard2.buttons["Continue"]
        if continueButton2.waitForExistence(timeout: TestConstants.defaultTimeout) {
            continueButton2.tap()
        }
        
        // Web view should open to enter password
        let webView2 = app.webViews.firstMatch
        XCTAssertTrue(webView2.waitForExistence(timeout: TestConstants.longTimeout), "Password login web view should appear")
        
        // Find password field for login
        let passwordFieldLogin = webView2.secureTextFields["Enter a password"]
        XCTAssertTrue(passwordFieldLogin.waitForExistence(timeout: TestConstants.defaultTimeout), "Login password field should exist")
        
        // Enter password
        passwordFieldLogin.tap()
        passwordFieldLogin.typeText(passwordToSet)
        
        // Find and tap the Continue button
        let continuePasswordButton = webView2.buttons["Continue"]
        continuePasswordButton.tap()
        
        // Verify successful login by waiting for the wallets view
        waitForWalletsView()
    }
    
    // MARK: - Solana Tests (test13-test15)
    func test13CreateSolanaWalletFlow() throws {
        createAccountWithPasskey()
        createSolanaWallet()
    }
    
    func test14SolanaWalletBasicFlow() throws {
        createAccountWithPasskey()
        navigateToSolanaWallet()
        
        app.buttons["copyAddressButton"].tap()
        
        let alert = app.alerts.firstMatch
        XCTAssertTrue(alert.waitForExistence(timeout: TestConstants.defaultTimeout), "Success alert should appear")
        XCTAssertTrue(alert.staticTexts["Success"].exists, "Should show success")
        alert.buttons["OK"].tap()
    }
    
    func test15SolanaMessageSigningFlow() throws {
        createAccountWithPasskey()
        navigateToSolanaWallet()
        
        let messageField = app.textFields["Enter a message to sign"]
        messageField.tap()
        messageField.typeText("Hello Solana!")
        
        app.buttons["Sign Message"].tap()
        
        let alert = app.alerts.firstMatch
        XCTAssertTrue(alert.waitForExistence(timeout: TestConstants.longTimeout), "Alert should appear")
        XCTAssertTrue(alert.staticTexts["Success"].exists, "Should succeed")
        alert.buttons["OK"].tap()
    }
}

