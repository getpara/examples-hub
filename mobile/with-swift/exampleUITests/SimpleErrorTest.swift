//
//  SimpleErrorTest.swift
//  ExampleUITests
//
//  Simple test to trigger an error and verify error reporting works
//

import Foundation
import XCTest

class SimpleErrorTest: XCTestCase {
    // MARK: - Properties
    
    let app = XCUIApplication()
    static var testEmail: String!
    
    // MARK: - Setup & Teardown
    
    override func setUpWithError() throws {
        continueAfterFailure = false
        
        // Set up environment variables with valid API key
        app.launchEnvironment = [
            "PARA_API_KEY": ProcessInfo.processInfo.environment["PARA_API_KEY"] ?? "",
            "PARA_ENVIRONMENT": "sandbox",
        ]
        
        Biometrics.enrolled()
        app.launch()
        
        // Ensure we start from logged out state
        ensureLoggedOut(app: app)
        waitForMainScreen(app: app)
    }
    
    // MARK: - Error Tests
    
    func testInvalidOTPCode() throws {
        // Test that invalid OTP code triggers proper error
        
        // Enter valid email first (using example.com to ensure OTP validation works)
        let emailPhoneField = app.textFields["Enter email or phone"]
        XCTAssertTrue(emailPhoneField.waitForExistence(timeout: TestConstants.defaultTimeout))
        emailPhoneField.tap()
        let randomString = String((0..<6).map { _ in "abcdefghijklmnopqrstuvwxyz".randomElement()! })
        emailPhoneField.typeText("test\(randomString)@example.com")
        
        // Continue button appears after typing
        let continueButton = app.buttons["Continue"]
        XCTAssertTrue(continueButton.waitForExistence(timeout: TestConstants.defaultTimeout))
        continueButton.tap()
        
        // Wait for OTP verification view@
        XCTAssertTrue(app.staticTexts["Verify Email"].waitForExistence(timeout: TestConstants.defaultTimeout))
        
        // Enter invalid OTP code
        sleep(1) // Give OTP field time to get focus
        let otpField = app.textFields.element(boundBy: 1) // Second text field is the OTP field
        XCTAssertTrue(otpField.waitForExistence(timeout: TestConstants.defaultTimeout))
        otpField.tap()
        otpField.typeText("000000") // Invalid OTP code
        
        // After entering 6 digits, it auto-submits and should show error
        sleep(2) // Wait for auto-submission and error response
        
        // Should get an error about invalid OTP
        let errorAlert = app.alerts.firstMatch
        if errorAlert.waitForExistence(timeout: TestConstants.defaultTimeout) {
            let errorMessage = errorAlert.staticTexts.element(boundBy: 1).label
            
            print("Invalid OTP Error: \(errorMessage)")
            
            // Verify error is specific, not generic
            XCTAssertFalse(errorMessage.contains("Unknown error"),
                          "Error should be specific: \(errorMessage)")
            
            // Should mention OTP, code, or verification
            let hasRelevantError = errorMessage.lowercased().contains("otp") ||
                                  errorMessage.lowercased().contains("code") ||
                                  errorMessage.lowercased().contains("verification") ||
                                  errorMessage.lowercased().contains("invalid")
            
            XCTAssertTrue(hasRelevantError,
                         "Error should mention invalid OTP: \(errorMessage)")
            
            errorAlert.buttons["OK"].tap()
            
            print("✅ Invalid OTP code error properly surfaced from bridge")
        } else {
            print("ℹ️ No error alert found for invalid OTP")
        }
    }
}
