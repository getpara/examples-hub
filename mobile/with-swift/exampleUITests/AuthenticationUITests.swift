//
//  AuthenticationUITests.swift
//  ExampleUITests
//
//  Tests for authentication flows - each test creates a fresh account
//

import Foundation
import XCTest

class AuthenticationUITests: XCTestCase {
    // MARK: - Properties

    let app = XCUIApplication()

    // MARK: - Setup & Teardown

    override func setUpWithError() throws {
        continueAfterFailure = false

        // Set up environment variables
        app.launchEnvironment = [
            "PARA_API_KEY": ProcessInfo.processInfo.environment["PARA_API_KEY"] ?? "",
            "PARA_ENVIRONMENT": "sandbox",
            "RPC_URL": ProcessInfo.processInfo.environment["RPC_URL"] ?? "",
        ]

        Biometrics.enrolled()
        app.launch()

        // Ensure we start from logged out state
        ensureLoggedOut(app: app)
        waitForMainScreen(app: app)
    }

    // MARK: - Authentication Tests

    func testEmailPasskeyFlow() throws {
        // PART 1: SIGNUP
        let uniqueEmail = TestConstants.generateUniqueEmail()
        print("DEBUG: Generated email: \(uniqueEmail)")
        
        performEmailAuthWithPasskey(app: app, email: uniqueEmail)
        waitForWalletsView(app: app)

        // PART 2: TEST LOGIN
        app.buttons["logoutButton"].tap()
        waitForMainScreen(app: app)
        
        performLoginFlow(app: app, credential: uniqueEmail)
        waitForWalletsView(app: app)
    }

    func testPhonePasskeyFlow() throws {
        // PART 1: SIGNUP
        let phoneNumber = TestConstants.generateTestPhoneNumber()
        
        performPhoneAuthWithPasskey(app: app, phone: phoneNumber)
        waitForWalletsView(app: app)

        // PART 2: TEST LOGIN
        app.buttons["logoutButton"].tap()
        waitForMainScreen(app: app)
        
        performLoginFlow(app: app, credential: phoneNumber)
        waitForWalletsView(app: app)
    }

    // Commenting out password flow test as password auth is not implemented at this time
    /*
    func testEmailPasswordFlow() throws {
        // Start email authentication
        let emailButton = app.buttons["emailAuthButton"]
        XCTAssertTrue(emailButton.exists)
        emailButton.tap()

        // Enter email
        let timestamp = Int(Date().timeIntervalSince1970)
        let uniqueEmail = "test\(timestamp)@\(TestConstants.emailDomain)"

        let emailField = app.textFields["emailInputField"]
        emailField.tap()
        emailField.typeText(uniqueEmail)
        app.buttons["continueButton"].tap()

        // Verify email verification view
        let verifyNavBar = app.navigationBars["Verify Email"]
        XCTAssertTrue(verifyNavBar.waitForExistence(timeout: TestConstants.defaultTimeout), "Verify Email view should appear")

        // Enter verification code
        enterVerificationCode(app: app)

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
        tapNotNowOnPasswordModal(app: app)

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
        waitForWalletsView(app: app)

        // Create first EVM wallet using the big button if no wallets exist
        let createFirstWalletButton = app.buttons["createFirstWalletButton"]
        if createFirstWalletButton.exists {
            createFirstWalletButton.tap()
            // Wait for wallet to be created
            let firstWalletCell = app.cells.element(boundBy: 0)
            XCTAssertTrue(firstWalletCell.waitForExistence(timeout: TestConstants.longTimeout), "First wallet should be created")
        }

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
        let passwordFieldLogin = webView2.secureTextFields["Enter password"]
        XCTAssertTrue(passwordFieldLogin.waitForExistence(timeout: TestConstants.defaultTimeout), "Login password field should exist")

        // Enter password
        passwordFieldLogin.tap()
        passwordFieldLogin.typeText(passwordToSet)

        // Find and tap the Continue button
        let continuePasswordButton = webView2.buttons["Continue"]
        continuePasswordButton.tap()

        // Verify successful login by waiting for the wallets view
        waitForWalletsView(app: app)
    }
    */
}
