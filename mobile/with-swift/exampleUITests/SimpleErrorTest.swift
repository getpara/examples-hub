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
    
    // MARK: - Setup & Teardown
    
    override func setUpWithError() throws {
        continueAfterFailure = false
        
        // Set up environment variables - use invalid API key to trigger errors
        app.launchEnvironment = [
            "PARA_API_KEY": "invalid_api_key_for_testing_errors",
            "PARA_ENVIRONMENT": "sandbox",
        ]
        
        app.launch()
        
        // Ensure we start from logged out state
        ensureLoggedOut(app: app)
        waitForMainScreen(app: app)
    }
    
    // MARK: - Error Tests
    
    func testInvalidAPIKeyError() throws {
        // Test that invalid API key triggers proper error
        
        // Try email authentication with invalid API key
        let emailButton = app.buttons["emailAuthButton"]
        XCTAssertTrue(emailButton.waitForExistence(timeout: TestConstants.defaultTimeout))
        emailButton.tap()
        
        // Enter email
        let emailField = app.textFields["emailInputField"]
        XCTAssertTrue(emailField.waitForExistence(timeout: TestConstants.defaultTimeout))
        emailField.tap()
        emailField.typeText("test@example.com")
        
        let continueButton = app.buttons["continueButton"]
        XCTAssertTrue(continueButton.exists)
        continueButton.tap()
        
        // Should get an error about invalid API key
        let errorAlert = app.alerts.firstMatch
        if errorAlert.waitForExistence(timeout: TestConstants.longTimeout) {
            let alertTitle = errorAlert.staticTexts.element(boundBy: 0).label
            let errorMessage = errorAlert.staticTexts.element(boundBy: 1).label
            
            print("Error Alert Title: \(alertTitle)")
            print("Error Message: \(errorMessage)")
            
            // Verify error is specific, not generic
            XCTAssertFalse(errorMessage.contains("Unknown error"),
                          "Error should be specific: \(errorMessage)")
            
            // Should mention API key or authentication
            let hasRelevantError = errorMessage.lowercased().contains("api") ||
                                  errorMessage.lowercased().contains("invalid") ||
                                  errorMessage.lowercased().contains("unauthorized")
            
            XCTAssertTrue(hasRelevantError,
                         "Error should mention API key or auth issue: \(errorMessage)")
            
            errorAlert.buttons["OK"].tap()
            
            print("✅ Error properly surfaced from bridge")
        } else {
            XCTFail("Expected error for invalid API key")
        }
    }
    
    func testNetworkTimeoutError() throws {
        // Test network timeout error handling
        
        // Use valid API key for this test
        app.terminate()
        app.launchEnvironment = [
            "PARA_API_KEY": ProcessInfo.processInfo.environment["PARA_API_KEY"] ?? "",
            "PARA_ENVIRONMENT": "sandbox",
            // Simulate slow network by using invalid RPC URL
            "RPC_URL": "https://invalid-rpc-endpoint.example.com",
        ]
        app.launch()
        
        // Login first
        let uniqueEmail = TestConstants.generateUniqueEmail()
        performEmailAuthWithPasskey(app: app, email: uniqueEmail)
        waitForWalletsView(app: app)
        
        // Try to fetch balance with invalid RPC - should timeout
        let evmWalletCell = app.cells["walletCell_EVM"]
        if evmWalletCell.waitForExistence(timeout: TestConstants.defaultTimeout) {
            evmWalletCell.tap()
            
            let fetchButton = app.buttons["Fetch Balance"]
            if fetchButton.waitForExistence(timeout: TestConstants.defaultTimeout) {
                fetchButton.tap()
                
                // Should get network/timeout error
                let errorAlert = app.alerts.firstMatch
                if errorAlert.waitForExistence(timeout: TestConstants.longTimeout) {
                    let errorMessage = errorAlert.staticTexts.element(boundBy: 1).label
                    
                    print("Network Error: \(errorMessage)")
                    
                    // Verify it's not generic
                    XCTAssertFalse(errorMessage.contains("Unknown error"),
                                  "Should have specific network error")
                    
                    errorAlert.buttons["OK"].tap()
                    print("✅ Network error properly handled")
                }
            }
        }
    }
}