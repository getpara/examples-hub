//
//  SharedTestHelpers.swift
//  ExampleUITests
//
//  Shared utilities and constants for all UI test classes
//

import Foundation
import XCTest

// MARK: - Test Constants

enum TestConstants {
    static let emailDomain = "test.usecapsule.com"
    static let verificationCode = "123456"
    static let defaultTimeout: TimeInterval = 5.0
    static let longTimeout: TimeInterval = 30.0

    static func generateTestPhoneNumber() -> String {
        // Use various valid US area codes
        let areaCodes = ["212", "310", "415", "512", "617", "702", "808", "919"]
        let areaCode = areaCodes.randomElement()!
        let lastFour = String(format: "%04d", Int.random(in: 0 ... 9999))
        return "\(areaCode)555\(lastFour)"
    }

    static func generateUniqueEmail() -> String {
        let randomLetters = "abcdefghijklmnopqrstuvwxyz"
        let randomString = String((0 ..< 6).map { _ in randomLetters.randomElement()! })
        return "test\(randomString)@\(emailDomain)"
    }
}

// MARK: - Shared Helper Methods

// Static helper for ensuring logged out state (for use in class setup methods)
enum TestHelper {
    static func ensureLoggedOut(app: XCUIApplication) {
        // Check if we're in the wallets view (logged in state)
        let walletsView = app.otherElements["walletsView"]
        let logoutButton = app.buttons["logoutButton"]

        if walletsView.exists || logoutButton.exists {
            // We're logged in, need to logout
            if !logoutButton.exists {
                // If logout button isn't visible, we might be in a wallet detail view
                // Navigate back to wallets list
                if app.navigationBars.buttons.element(boundBy: 0).exists {
                    app.navigationBars.buttons.element(boundBy: 0).tap()
                }
            }

            // Now tap logout
            if logoutButton.waitForExistence(timeout: TestConstants.defaultTimeout) {
                logoutButton.tap()
            }
        }

        // Wait for main screen to appear - check for the email/phone input field
        let emailPhoneField = app.textFields["Enter email or phone"]
        _ = emailPhoneField.waitForExistence(timeout: TestConstants.longTimeout)
    }

    // MARK: - Static Authentication Helpers (for class setup)

    static func performEmailAuthWithPasskey(app: XCUIApplication, email: String) {
        // Enter email in unified field
        let emailPhoneField = app.textFields["Enter email or phone"]
        _ = emailPhoneField.waitForExistence(timeout: TestConstants.defaultTimeout)
        emailPhoneField.tap()

        // Clear and type email
        if let existingText = emailPhoneField.value as? String, !existingText.isEmpty {
            let deleteString = String(repeating: XCUIKeyboardKey.delete.rawValue, count: existingText.count)
            emailPhoneField.typeText(deleteString)
        }
        emailPhoneField.typeText(email)

        // Continue button appears after typing
        let continueButton = app.buttons["Continue"]
        _ = continueButton.waitForExistence(timeout: TestConstants.defaultTimeout)
        continueButton.tap()

        // Wait for OTP verification view
        _ = app.staticTexts["Verify Email"].waitForExistence(timeout: TestConstants.defaultTimeout)

        // Enter OTP code - find the field that has keyboard focus
        sleep(1) // Give OTP field time to get focus
        let otpField = app.textFields.element(boundBy: 1) // Second text field is the OTP field
        _ = otpField.waitForExistence(timeout: TestConstants.defaultTimeout)
        otpField.tap()
        otpField.typeText(TestConstants.verificationCode)

        // After entering 6 digits, it auto-submits
        sleep(2) // Wait for auto-submission

        // Complete biometric authentication
        performBiometricAuthentication(app: app)
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
}

extension XCTestCase {
    func ensureLoggedOut(app: XCUIApplication) {
        TestHelper.ensureLoggedOut(app: app)
    }

    func waitForMainScreen(app: XCUIApplication) {
        let emailPhoneField = app.textFields["Enter email or phone"]
        XCTAssertTrue(emailPhoneField.waitForExistence(timeout: TestConstants.longTimeout), "Main screen should appear")
    }

    func performBiometricAuthentication(app: XCUIApplication) {
        // For signup/account creation
        performBiometricAuthenticationWithOffsetFromBottom(100, app: app)
    }

    func performBiometricAuthenticationForLogin(app: XCUIApplication) {
        // For login - button appears higher from bottom
        performBiometricAuthenticationWithOffsetFromBottom(50, app: app)
    }

    func performBiometricAuthenticationWithOffsetFromBottom(_ offsetFromBottom: CGFloat, app: XCUIApplication) {
        let window = app.windows.firstMatch
        let screenWidth = window.frame.size.width
        let screenHeight = window.frame.size.height

        let normalizedX = (screenWidth / 2) / screenWidth
        let normalizedY = (screenHeight - offsetFromBottom) / screenHeight

        let tapCoordinate = window.coordinate(withNormalizedOffset: CGVector(dx: normalizedX, dy: normalizedY))
        sleep(5)
        tapCoordinate.tap()
        sleep(2)
        Biometrics.successfulAuthentication()
        sleep(1)
    }

    func tapNotNowOnPasswordModal(app: XCUIApplication) {
        sleep(3)
        let window = app.windows.firstMatch
        let tapCoordinate = window.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.92))
        tapCoordinate.tap()
        sleep(1)
    }

    // MARK: - Authentication Flow Helpers

    /// Performs complete email authentication flow with passkey
    func performEmailAuthWithPasskey(app: XCUIApplication, email: String) {
        // Enter email in unified field
        let emailPhoneField = app.textFields["Enter email or phone"]
        XCTAssertTrue(emailPhoneField.waitForExistence(timeout: TestConstants.defaultTimeout))
        emailPhoneField.tap()
        emailPhoneField.typeText(email)

        // Continue button appears after typing
        let continueButton = app.buttons["Continue"]
        XCTAssertTrue(continueButton.waitForExistence(timeout: TestConstants.defaultTimeout))
        continueButton.tap()

        // Wait for OTP verification view
        XCTAssertTrue(app.staticTexts["Verify Email"].waitForExistence(timeout: TestConstants.defaultTimeout))

        // Enter OTP code - find the field that has keyboard focus
        sleep(1) // Give OTP field time to get focus
        let otpField = app.textFields.element(boundBy: 1) // Second text field is the OTP field
        XCTAssertTrue(otpField.waitForExistence(timeout: TestConstants.defaultTimeout))
        otpField.tap()
        otpField.typeText(TestConstants.verificationCode)
        sleep(1)

        // Complete biometric authentication
        performBiometricAuthentication(app: app)
    }

    /// Performs complete phone authentication flow with passkey
    func performPhoneAuthWithPasskey(app: XCUIApplication, phone: String) {
        // Enter phone in unified field
        let emailPhoneField = app.textFields["Enter email or phone"]
        XCTAssertTrue(emailPhoneField.waitForExistence(timeout: TestConstants.defaultTimeout))
        emailPhoneField.tap()
        emailPhoneField.typeText(phone)

        // Continue button appears after typing
        let continueButton = app.buttons["Continue"]
        XCTAssertTrue(continueButton.waitForExistence(timeout: TestConstants.defaultTimeout))
        continueButton.tap()

        // Wait for OTP verification view
        XCTAssertTrue(app.staticTexts["Verify Phone"].waitForExistence(timeout: TestConstants.defaultTimeout))

        // Enter OTP code - find the field that has keyboard focus
        sleep(1) // Give OTP field time to get focus
        let otpField = app.textFields.element(boundBy: 1) // Second text field is the OTP field
        XCTAssertTrue(otpField.waitForExistence(timeout: TestConstants.defaultTimeout))
        otpField.tap()
        otpField.typeText(TestConstants.verificationCode)
        sleep(1)

        // Complete biometric authentication
        performBiometricAuthentication(app: app)
    }

    /// Performs login flow for existing user
    func performLoginFlow(app: XCUIApplication, credential: String) {
        // Enter email or phone in unified field
        let emailPhoneField = app.textFields["Enter email or phone"]
        XCTAssertTrue(emailPhoneField.waitForExistence(timeout: TestConstants.defaultTimeout))
        emailPhoneField.tap()
        emailPhoneField.typeText(credential)

        // Continue button appears after typing
        let continueButton = app.buttons["Continue"]
        XCTAssertTrue(continueButton.waitForExistence(timeout: TestConstants.defaultTimeout))
        continueButton.tap()

        // Perform biometric authentication for login
        performBiometricAuthenticationForLogin(app: app)
    }

    func waitForWalletsView(app: XCUIApplication) {
        let walletsView = app.otherElements["walletsView"]
        XCTAssertTrue(walletsView.waitForExistence(timeout: TestConstants.longTimeout), "Wallets view should appear")

        // Check if we have wallets or the create first wallet button
        let firstWalletCell = app.cells.element(boundBy: 0)
        let createFirstWalletButton = app.buttons["createFirstWalletButton"]

        let hasWallets = firstWalletCell.waitForExistence(timeout: TestConstants.defaultTimeout)
        let hasCreateButton = createFirstWalletButton.waitForExistence(timeout: TestConstants.defaultTimeout)

        XCTAssertTrue(hasWallets || hasCreateButton, "Either first wallet should exist or create wallet button should be visible")
    }

    func waitForAndDismissAlert(app: XCUIApplication, validateSuccess: Bool = true) {
        let alert = app.alerts.firstMatch
        XCTAssertTrue(alert.waitForExistence(timeout: TestConstants.longTimeout), "Alert should appear")

        if validateSuccess {
            XCTAssertTrue(alert.staticTexts["Success"].exists, "Should show success")
        }

        alert.buttons["OK"].tap()
    }
}

// MARK: - XCUIElement Extensions

extension XCUIElement {
    func clearAndTypeText(_ text: String) {
        guard let stringValue = value as? String else {
            typeText(text)
            return
        }

        tap()
        let deleteString = String(repeating: XCUIKeyboardKey.delete.rawValue, count: stringValue.count)
        typeText(deleteString)
        typeText(text)
    }
}
