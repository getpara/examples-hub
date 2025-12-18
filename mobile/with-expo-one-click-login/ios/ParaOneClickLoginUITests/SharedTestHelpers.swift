//
//  SharedTestHelpers.swift
//  ParaOneClickLoginUITests
//

import XCTest

enum TestConstants {
    static let emailDomain = "test.getpara.com"
    static let verificationCode = "123456"
    static let defaultTimeout: TimeInterval = 5.0
    static let longTimeout: TimeInterval = 30.0

    static func generateUniqueEmail() -> String {
        let timestamp = Int(Date().timeIntervalSince1970)
        return "uitest\(timestamp)@\(emailDomain)"
    }
}

enum TestHelper {
    @discardableResult
    static func allowSignInIfNeeded(app: XCUIApplication, pollDuration: TimeInterval = 0) -> Bool {
        let springboard = XCUIApplication(bundleIdentifier: "com.apple.springboard")
        let authServicesUI = XCUIApplication(bundleIdentifier: "com.apple.AuthenticationServicesUI")
        let deadline = Date().addingTimeInterval(pollDuration)

        repeat {
            let appAlert = app.alerts.firstMatch
            if appAlert.exists, appAlert.buttons["Continue"].firstMatch.robustTap() {
                return true
            }

            let authContinue = authServicesUI.buttons["Continue"].firstMatch
            if authContinue.exists, authContinue.robustTap() {
                return true
            }

            let springboardAlert = springboard.alerts.firstMatch
            if springboardAlert.exists, springboardAlert.buttons["Continue"].firstMatch.robustTap() {
                return true
            }

            if XCTestCase.bruteforceRightButtonTap(in: authServicesUI) {
                return true
            }
            if XCTestCase.bruteforceRightButtonTap(in: springboard) {
                return true
            }

            guard pollDuration > 0 else { break }
            RunLoop.current.run(until: Date().addingTimeInterval(0.2))
        } while Date() < deadline

        return false
    }

    @discardableResult
    static func waitForWalletsView(app: XCUIApplication) -> Bool {
        let walletsView = app.otherElements["walletsView"]
        return walletsView.waitForExistence(timeout: TestConstants.longTimeout)
    }

    static func performOneClickAuthentication(
        app: XCUIApplication,
        testCase: XCTestCase,
        credential: String,
        otpCode: String = TestConstants.verificationCode
    ) {
        // 1. Enter email/phone
        let authInput = app.textFields["authInput"]
        let inputExists = authInput.waitForExistence(timeout: TestConstants.longTimeout)
        XCTAssertTrue(inputExists, "Auth input field did not appear")
        guard inputExists else { return }

        authInput.tap()
        authInput.typeText(credential)

        // 2. Tap continue
        let continueButton = app.buttons["continueButton"]
        let continueExists = continueButton.waitForExistence(timeout: TestConstants.defaultTimeout)
        XCTAssertTrue(continueExists, "Continue button did not appear")
        guard continueExists else { return }

        let monitor = testCase.installASWebAuthConsentMonitor()
        defer { testCase.removeUIInterruptionMonitor(monitor) }

        let didTapContinue = continueButton.robustTap(timeout: 3)
        XCTAssertTrue(didTapContinue, "Continue button was not tappable")
        guard didTapContinue else { return }

        app.nudgeForInterruptionHandling()
        _ = allowSignInIfNeeded(app: app, pollDuration: 2)

        // 3. Wait for Safari to appear
        let safariApp = XCUIApplication(bundleIdentifier: "com.apple.SafariViewService")
        let launchDeadline = Date().addingTimeInterval(TestConstants.longTimeout)
        while Date() < launchDeadline && safariApp.state != .runningForeground {
            _ = allowSignInIfNeeded(app: app)
            RunLoop.current.run(until: Date().addingTimeInterval(0.2))
        }

        XCTAssertEqual(safariApp.state, .runningForeground, "Safari web view was never presented")
        guard safariApp.state == .runningForeground else { return }

        // 4. Enter OTP in webview
        let webView = safariApp.webViews.firstMatch
        let webViewAppeared = webView.waitForExistence(timeout: TestConstants.longTimeout)
        XCTAssertTrue(webViewAppeared, "Safari web view failed to load")
        guard webViewAppeared else { return }

        var otpFields = webView.textFields.allElementsBoundByIndex + webView.secureTextFields.allElementsBoundByIndex
        let otpDeadline = Date().addingTimeInterval(TestConstants.longTimeout)
        while otpFields.isEmpty && Date() < otpDeadline {
            RunLoop.current.run(until: Date().addingTimeInterval(0.2))
            otpFields = webView.textFields.allElementsBoundByIndex + webView.secureTextFields.allElementsBoundByIndex
        }

        XCTAssertTrue(!otpFields.isEmpty, "OTP fields not found")
        guard !otpFields.isEmpty else { return }

        XCTAssertTrue(otpFields.count >= otpCode.count, "Not enough OTP fields")
        guard otpFields.count >= otpCode.count else { return }

        let digits = Array(otpCode)
        for (index, digit) in digits.enumerated() {
            let field = otpFields[index]
            let fieldExists = field.waitForExistence(timeout: 1)
            XCTAssertTrue(fieldExists, "OTP field \(index + 1) not found")
            guard fieldExists else { return }
            field.tap()
            field.typeText(String(digit))
            RunLoop.current.run(until: Date().addingTimeInterval(0.1))
        }

        // 5. Wait for Safari to dismiss
        let dismissalDeadline = Date().addingTimeInterval(TestConstants.longTimeout)
        while safariApp.state == .runningForeground && Date() < dismissalDeadline {
            RunLoop.current.run(until: Date().addingTimeInterval(0.2))
        }

        // 6. Verify wallet view appears
        let mainAppReturned = app.wait(for: .runningForeground, timeout: TestConstants.defaultTimeout)
        XCTAssertTrue(mainAppReturned, "Main app did not return to foreground")
        guard mainAppReturned else { return }

        let walletsVisible = waitForWalletsView(app: app)
        XCTAssertTrue(walletsVisible, "Wallets view did not appear after login")
    }
}

extension XCTestCase {
    func performOneClickAuthentication(
        app: XCUIApplication,
        credential: String,
        otpCode: String = TestConstants.verificationCode
    ) {
        TestHelper.performOneClickAuthentication(
            app: app,
            testCase: self,
            credential: credential,
            otpCode: otpCode
        )
    }

    func waitForWalletsView(app: XCUIApplication) {
        XCTAssertTrue(
            TestHelper.waitForWalletsView(app: app),
            "Wallets view should appear"
        )
    }
}

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
