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
        let lastFour = String(format: "%04d", Int.random(in: 0 ... 9999))
        return "408555\(lastFour)"
    }

    static func generateUniqueEmail() -> String {
        let timestamp = Int(Date().timeIntervalSince1970)
        return "test+\(String(format: "%010x", timestamp))@\(emailDomain)"
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

        // Wait for main screen to appear
        let emailButton = app.buttons["emailAuthButton"]
        _ = emailButton.waitForExistence(timeout: TestConstants.longTimeout)
    }
}

extension XCTestCase {
    func ensureLoggedOut(app: XCUIApplication) {
        TestHelper.ensureLoggedOut(app: app)
    }

    func waitForMainScreen(app: XCUIApplication) {
        let emailButton = app.buttons["emailAuthButton"]
        XCTAssertTrue(emailButton.waitForExistence(timeout: TestConstants.longTimeout), "Main screen should appear")
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

    func enterVerificationCode(app: XCUIApplication) {
        let codeInput = app.textFields["verificationCodeField"]
        XCTAssertTrue(codeInput.waitForExistence(timeout: TestConstants.defaultTimeout), "Verification code field should exist")
        codeInput.tap()
        codeInput.typeText(TestConstants.verificationCode)
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
