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
        static var savedPhoneNumber: String?
        static var savedEmail: String?
        
        static func generateTestPhoneNumber() -> String {
            let lastFour = String(format: "%04d", Int.random(in: 0...9999))
            return "408555\(lastFour)"
        }
        
        static let defaultTimeout: TimeInterval = 5.0
        static let longTimeout: TimeInterval = 20.0
    }
    
    // MARK: - Setup & Teardown
    override func setUpWithError() throws {
        // Put setup code here. This method is called before the invocation of each test method in the class.
        continueAfterFailure = false
        
        // Set up environment variables for testing
        app.launchEnvironment = [
            "PARA_API_KEY": ProcessInfo.processInfo.environment["PARA_API_KEY"] ?? "",
            "PARA_ENVIRONMENT": "sandbox",
            "RPC_URL": ProcessInfo.processInfo.environment["RPC_URL"] ?? ""
        ]
        
        Biometrics.enrolled()
        
        app.launch()
    }
    
    override func tearDownWithError() throws {
        // Put teardown code here. This method is called after the invocation of each test method in the class.
    }
    
    // MARK: - Helper Methods
    private func performBiometricAuthentication(offsetFromBottom: CGFloat) {
        let window = app.windows.firstMatch
        let screenWidth = window.frame.size.width
        let screenHeight = window.frame.size.height
        
        let normalizedX = (screenWidth / 2) / screenWidth
        let normalizedY = (screenHeight - offsetFromBottom) / screenHeight
        
        let tapCoordinate = window.coordinate(withNormalizedOffset: CGVector(dx: normalizedX, dy: normalizedY))
        sleep(3)
        tapCoordinate.tap()
        sleep(2)
        Biometrics.successfulAuthentication()
        sleep(1)
    }
    
    private func enterVerificationCode(_ code: String, fieldIdentifier: String) {
        let codeInput = app.textFields[fieldIdentifier]
        XCTAssertTrue(codeInput.waitForExistence(timeout: TestConstants.defaultTimeout), "Verification code input field should exist")
        codeInput.tap()
        codeInput.typeText(code)
    }
    
    private func waitForWalletsView() {
        let homeView = app.otherElements["walletsView"]
        XCTAssertTrue(homeView.waitForExistence(timeout: TestConstants.longTimeout), "Wallets view should appear after successful authentication")
        
        // Wait for and verify that there is at least one wallet listed
        let walletCells = app.cells
        XCTAssertTrue(walletCells.firstMatch.waitForExistence(timeout: TestConstants.defaultTimeout), "At least one wallet cell should exist")
        
        // Verify the first wallet cell exists and is tappable
        let firstWalletCell = walletCells.element(boundBy: 0)
        XCTAssertTrue(firstWalletCell.exists, "First wallet cell should exist")
        XCTAssertTrue(firstWalletCell.isHittable, "First wallet cell should be tappable")
    }
    
    // MARK: - Test Methods
    func test01EmailAuthenticationFlow() throws {
        // Start email authentication
        let emailButton = app.buttons["emailAuthButton"]
        XCTAssertTrue(emailButton.exists)
        emailButton.tap()
        
        // Enter email and save it
        let timestamp = Int(Date().timeIntervalSince1970)
        let uniqueEmail = "teste2e+\(String(format: "%010x", timestamp))@\(TestConstants.emailDomain)"
        TestConstants.savedEmail = uniqueEmail
        
        let emailField = app.textFields["emailInputField"]
        emailField.tap()
        emailField.typeText(uniqueEmail)
        app.buttons["continueButton"].tap()
        
        // Verify email verification view
        let verifyNavBar = app.navigationBars["Verify Email"]
        XCTAssertTrue(verifyNavBar.waitForExistence(timeout: 5.0), "Verification view should appear")
        
        // Enter verification code
        enterVerificationCode(TestConstants.verificationCode, fieldIdentifier: "Verification Code")
        
        // Complete verification
        let verifyButton = app.buttons["verifyButton"]
        XCTAssertTrue(verifyButton.waitForExistence(timeout: 5.0), "Verify button should exist")
        verifyButton.tap()
        
        // Perform biometric authentication
        performBiometricAuthentication(offsetFromBottom: 100)
        
        // Verify successful authentication
        waitForWalletsView()
    }
    
    func test02PhoneAuthenticationFlow() throws {
        // Start phone authentication
        let phoneButton = app.buttons["phoneAuthButton"]
        XCTAssertTrue(phoneButton.exists)
        phoneButton.tap()
        
        // Enter phone number and save it
        let phoneNumber = TestConstants.generateTestPhoneNumber()
        TestConstants.savedPhoneNumber = phoneNumber
        
        let phoneField = app.textFields["phoneInputField"]
        phoneField.tap()
        phoneField.typeText(phoneNumber)
        app.buttons["continueButton"].tap()
        
        // Verify email verification view
        let verifyNavBar = app.navigationBars["Verify Phone"]
        XCTAssertTrue(verifyNavBar.waitForExistence(timeout: 5.0), "Verification view should appear")
        
        // Enter verification code
        enterVerificationCode(TestConstants.verificationCode, fieldIdentifier: "Verification Code")
        
        // Complete verification
        let verifyButton = app.buttons["verifyButton"]
        XCTAssertTrue(verifyButton.waitForExistence(timeout: 5.0), "Verify button should exist")
        verifyButton.tap()
        
        // Perform biometric authentication
        performBiometricAuthentication(offsetFromBottom: 100)
        
        // Verify successful authentication
        waitForWalletsView()
    }
    
    func test03EmailPasskeyLoginFlow() throws {
        // Start email authentication
        let emailButton = app.buttons["emailAuthButton"]
        XCTAssertTrue(emailButton.exists)
        emailButton.tap()
        
        // Enter the saved email from signup
        guard let savedEmail = TestConstants.savedEmail else {
            XCTFail("No saved email found. Run testEmailAuthenticationFlow first.")
            return
        }
        
        let emailField = app.textFields["emailInputField"]
        emailField.tap()
        emailField.typeText(savedEmail)
        app.buttons["continueButton"].tap()
        
        // Perform biometric authentication
        performBiometricAuthentication(offsetFromBottom: 50)
        
        // Verify successful authentication
        waitForWalletsView()
    }
    
    func test04PasskeyLoginFlow() throws {
        // Start phone authentication
        let phoneButton = app.buttons["phoneAuthButton"]
        XCTAssertTrue(phoneButton.exists)
        phoneButton.tap()
        
        // Enter the saved phone number from signup
        guard let savedPhoneNumber = TestConstants.savedPhoneNumber else {
            XCTFail("No saved phone number found. Run testPhoneAuthenticationFlow first.")
            return
        }
        
        let phoneField = app.textFields["phoneInputField"]
        phoneField.tap()
        phoneField.typeText(savedPhoneNumber)
        app.buttons["continueButton"].tap()
        
        // Perform biometric authentication
        performBiometricAuthentication(offsetFromBottom: 50)
        
        // Verify successful authentication
        waitForWalletsView()
    }
}

