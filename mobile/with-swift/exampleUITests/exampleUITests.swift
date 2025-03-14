//
//  ExampleUITests.swift
//  ExampleUITests
//
//  Created by Tyson Williams on 3/10/25.
//

import XCTest

class ExampleUITests: XCTestCase {
    let app = XCUIApplication()
    
    // Test constants matching web example
    let TEST_EMAIL_DOMAIN = "test.usecapsule.com"
    let VERIFICATION_CODE = "123456"
    let MESSAGE_TO_SIGN = "hello world"
    
    override func setUpWithError() throws {
        // Put setup code here. This method is called before the invocation of each test method in the class.
        continueAfterFailure = false
        
        // Set up environment variables for testing
        app.launchEnvironment = [
            "PARA_API_KEY": ProcessInfo.processInfo.environment["PARA_API_KEY"] ?? "",
            "PARA_ENVIRONMENT": "sandbox",
            "RPC_URL": ProcessInfo.processInfo.environment["RPC_URL"] ?? ""
            // Add any other environment variables your app needs
        ]
        
        app.launch()
    }
    
    override func tearDownWithError() throws {
        // Put teardown code here. This method is called after the invocation of each test method in the class.
    }
    
    func testEmailAuthenticationFlow() throws {
        // Test complete email authentication flow
        let emailButton = app.buttons["emailAuthButton"]
        XCTAssertTrue(emailButton.exists)
        emailButton.tap()
        
        // Enter email and continue
        let timestamp = Int(Date().timeIntervalSince1970)
        let uniqueEmail = "teste2e+\(String(format: "%010x", timestamp))@\(TEST_EMAIL_DOMAIN)"
        
        let emailField = app.textFields["emailInputField"]
        emailField.tap()
        emailField.typeText(uniqueEmail)
        app.buttons["continueButton"].tap()
        
        // Wait for the verification view to appear by checking the navigation bar title
        let verifyNavBar = app.navigationBars["Verify Email"]
        XCTAssertTrue(verifyNavBar.waitForExistence(timeout: 5.0), "Verification view should appear")
        
        // Wait for the text field to exist before trying to tap it
        let codeInput = app.textFields["Verification Code"]
        XCTAssertTrue(codeInput.waitForExistence(timeout: 5.0), "Verification code input field should exist")
        codeInput.tap()
        codeInput.typeText(VERIFICATION_CODE)
        
        // Wait for the verify button using its explicit accessibility label
        let verifyButton = app.buttons["Verify Button"]
        XCTAssertTrue(verifyButton.waitForExistence(timeout: 5.0), "Verify button should exist")
        verifyButton.tap()
        
        // Verify successful authentication and wallet creation (ToDo: need to figure out faceID enrollment in automated tests)
        //let homeView = app.otherElements["homeView"]
        //XCTAssertTrue(homeView.waitForExistence(timeout: 20.0), "Home view should appear after successful authentication")
    }
    
//    func testPhoneAuthenticationFlow() throws {
//        // Test complete phone authentication flow
//        let phoneButton = app.buttons["phoneAuthButton"]
//        XCTAssertTrue(phoneButton.exists)
//        phoneButton.tap()
//        
//        // Enter phone number
//        let phoneField = app.textFields["phoneInputField"]
//        phoneField.tap()
//        phoneField.typeText("5555555555")
//        app.buttons["continueButton"].tap()
//        
//        // Enter verification code
//        let codeInput = app.textFields["codeInput-0"]
//        codeInput.tap()
//        codeInput.typeText("123456")
//        
//        app.buttons["verifyButton"].tap()
//        
//        // Verify successful authentication and wallet creation
//        let homeView = app.otherElements["homeView"]
//        let homeViewAppears = NSPredicate(format: "exists == true")
//        let expectation = XCTNSPredicateExpectation(predicate: homeViewAppears, object: homeView)
//        
//        let result = XCTWaiter.wait(for: [expectation], timeout: 10.0)
//        XCTAssertEqual(result, .completed, "Home view should appear after successful authentication")
//    }
//    
//    func testOAuthAuthenticationFlow() throws {
//        // Test OAuth authentication flow
//        let oauthButton = app.buttons["oauthAuthButton"]
//        XCTAssertTrue(oauthButton.exists)
//        oauthButton.tap()
//        
//        // Select Google OAuth provider
//        let googleButton = app.buttons.matching(identifier: "googleOAuthButton").firstMatch
//        XCTAssertTrue(googleButton.exists)
//        googleButton.tap()
//        
//        // Wait for OAuth web view and completion
//        let homeView = app.otherElements["homeView"]
//        let homeViewAppears = NSPredicate(format: "exists == true")
//        let expectation = XCTNSPredicateExpectation(predicate: homeViewAppears, object: homeView)
//        
//        let result = XCTWaiter.wait(for: [expectation], timeout: 20.0)
//        XCTAssertEqual(result, .completed, "Home view should appear after successful OAuth authentication")
//    }
//    
//    func testWalletOperations() throws {
//        // First authenticate using email flow
//        try testEmailAuthenticationFlow()
//        
//        // Test wallet operations
//        let walletTab = app.buttons["walletTabButton"]
//        XCTAssertTrue(walletTab.exists)
//        walletTab.tap()
//        
//        // Test signing a message
//        let messageInput = app.textFields["messageInput"]
//        messageInput.tap()
//        messageInput.typeText(MESSAGE_TO_SIGN)
//        
//        app.buttons["signMessageButton"].tap()
//        
//        // Verify signature result
//        let signatureResult = app.staticTexts["signatureResultText"]
//        let signatureExists = NSPredicate(format: "exists == true")
//        let signatureExpectation = XCTNSPredicateExpectation(predicate: signatureExists, object: signatureResult)
//        
//        let result = XCTWaiter.wait(for: [signatureExpectation], timeout: 10.0)
//        XCTAssertEqual(result, .completed, "Should show signature result after signing message")
//        
//        // Test sending a transaction
//        app.buttons["sendTransactionButton"].tap()
//        
//        let recipientField = app.textFields["recipientAddressField"]
//        recipientField.tap()
//        recipientField.typeText("0x1234567890abcdef1234567890abcdef12345678")
//        
//        let amountField = app.textFields["transactionAmountField"]
//        amountField.tap()
//        amountField.typeText("0.01")
//        
//        app.buttons["confirmTransactionButton"].tap()
//        
//        // Verify transaction confirmation
//        let transactionConfirmation = app.staticTexts["transactionConfirmationText"]
//        let transactionExists = NSPredicate(format: "exists == true")
//        let transactionExpectation = XCTNSPredicateExpectation(predicate: transactionExists, object: transactionConfirmation)
//        
//        let transactionResult = XCTWaiter.wait(for: [transactionExpectation], timeout: 10.0)
//        XCTAssertEqual(transactionResult, .completed, "Should show transaction confirmation")
//    }
//    
//    func testLogoutAndReauthentication() throws {
//        // First authenticate
//        try testEmailAuthenticationFlow()
//        
//        // Perform logout
//        let userProfileButton = app.buttons["userProfileButton"]
//        XCTAssertTrue(userProfileButton.exists)
//        userProfileButton.tap()
//        
//        let logoutButton = app.buttons["logoutButton"]
//        XCTAssertTrue(logoutButton.exists)
//        logoutButton.tap()
//        
//        // Verify return to authentication view
//        let authView = app.otherElements["authenticationView"]
//        XCTAssertTrue(authView.exists, "Should return to authentication view after logout")
//        
//        // Test re-authentication with passkey
//        let passkeyButton = app.buttons["passkeyAuthButton"]
//        XCTAssertTrue(passkeyButton.exists)
//        passkeyButton.tap()
//        
//        // Verify successful re-authentication
//        let homeView = app.otherElements["homeView"]
//        let homeViewAppears = NSPredicate(format: "exists == true")
//        let expectation = XCTNSPredicateExpectation(predicate: homeViewAppears, object: homeView)
//        
//        let result = XCTWaiter.wait(for: [expectation], timeout: 10.0)
//        XCTAssertEqual(result, .completed, "Home view should appear after passkey re-authentication")
//    }
}

