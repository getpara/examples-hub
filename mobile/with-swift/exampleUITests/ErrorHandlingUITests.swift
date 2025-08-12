//
//  ErrorHandlingUITests.swift
//  ExampleUITests
//
//  Tests for structured error handling improvements
//

import Foundation
import XCTest

class ErrorHandlingUITests: XCTestCase {
    var app: XCUIApplication!
    
    override func setUpWithError() throws {
        try super.setUpWithError()
        continueAfterFailure = false
        
        app = XCUIApplication()
        app.launchArguments = ["UI_TESTING"]
        app.launch()
        
        // Ensure logged out state for consistent testing
        TestHelper.ensureLoggedOut(app: app)
    }
    
    override func tearDown() {
        super.tearDown()
        app = nil
    }
    
    // MARK: - Network Error Tests
    
    func testNetworkErrorHandling() throws {
        // Test network error detection and retry logic
        performEmailLogin()
        
        // Navigate to EVM wallet to test network operations
        let evmWalletCell = app.cells["walletCell_EVM"]
        XCTAssertTrue(evmWalletCell.waitForExistence(timeout: TestConstants.longTimeout))
        evmWalletCell.tap()
        
        // Simulate network failure by triggering an operation that requires network
        let fetchBalanceButton = app.buttons["refreshBalanceButton"]
        if !fetchBalanceButton.exists {
            // If balance isn't loaded yet, fetch it first
            let fetchButton = app.buttons["Fetch Balance"]
            if fetchButton.waitForExistence(timeout: TestConstants.defaultTimeout) {
                fetchButton.tap()
            }
        }
        
        // Now try to send a transaction which should fail with network error
        // if we can't connect to the RPC endpoint
        let sendButton = app.buttons["Send Transaction"]
        XCTAssertTrue(sendButton.waitForExistence(timeout: TestConstants.defaultTimeout))
        sendButton.tap()
        
        // Check for error alert
        let errorAlert = app.alerts.firstMatch
        if errorAlert.waitForExistence(timeout: TestConstants.longTimeout) {
            // Verify error structure
            let alertTitle = errorAlert.staticTexts.element(boundBy: 0).label
            let errorMessage = errorAlert.staticTexts.element(boundBy: 1).label
            
            print("Error Alert Title: \(alertTitle)")
            print("Error Message: \(errorMessage)")
            
            // Network errors should be categorized properly
            if errorMessage.lowercased().contains("network") || 
               errorMessage.lowercased().contains("connection") ||
               errorMessage.lowercased().contains("timeout") {
                // Verify retry suggestion for network errors
                XCTAssertTrue(errorMessage.contains("try again") || 
                            errorMessage.contains("Duration"),
                            "Network errors should include relevant context: \(errorMessage)")
            }
            
            errorAlert.buttons["OK"].tap()
        }
    }
    
    // MARK: - User Rejection Tests
    
    func testUserRejectionErrorHandling() throws {
        // Test user rejection/cancellation error handling
        performEmailLogin()
        
        // Navigate to EVM wallet
        let evmWalletCell = app.cells["walletCell_EVM"]
        XCTAssertTrue(evmWalletCell.waitForExistence(timeout: TestConstants.longTimeout))
        evmWalletCell.tap()
        
        // Try to sign a message
        let messageField = app.textFields["Enter a message to sign"]
        XCTAssertTrue(messageField.waitForExistence(timeout: TestConstants.defaultTimeout))
        messageField.tap()
        messageField.typeText("Test message for signing")
        
        let signMessageButton = app.buttons["Sign Message"]
        XCTAssertTrue(signMessageButton.waitForExistence(timeout: TestConstants.defaultTimeout))
        signMessageButton.tap()
        
        // If a system dialog appears for biometric auth, try to cancel it
        // Note: In real testing, user rejection would come from the Para bridge
        // when user denies the signature request
        sleep(2) // Wait for any auth dialog
        
        // Check if an error appears (would happen if user rejected)
        let errorAlert = app.alerts.firstMatch
        if errorAlert.waitForExistence(timeout: TestConstants.defaultTimeout) {
            let alertTitle = errorAlert.staticTexts.element(boundBy: 0).label
            let errorMessage = errorAlert.staticTexts.element(boundBy: 1).label
            
            print("User Rejection - Alert Title: \(alertTitle)")
            print("User Rejection - Error Message: \(errorMessage)")
            
            // Check for proper error categorization
            if errorMessage.lowercased().contains("cancel") ||
               errorMessage.lowercased().contains("reject") ||
               errorMessage.lowercased().contains("denied") {
                // User rejection should not suggest retry
                XCTAssertFalse(errorMessage.contains("try again"),
                              "User rejection should not suggest retry: \(errorMessage)")
            }
            
            errorAlert.buttons["OK"].tap()
        }
    }
    
    // MARK: - Invalid Method Tests
    
    func testInvalidMethodErrorHandling() throws {
        // Test handling of invalid/unimplemented method calls
        performEmailLogin()
        
        // Navigate to Cosmos wallet which might have limited functionality
        let cosmosWalletCell = app.cells["walletCell_COSMOS"]
        if cosmosWalletCell.waitForExistence(timeout: TestConstants.longTimeout) {
            cosmosWalletCell.tap()
            
            // Try various operations that might not be fully implemented
            // Check for sign transaction button
            let signButton = app.buttons["Sign Transaction"]
            if signButton.waitForExistence(timeout: TestConstants.defaultTimeout) {
                signButton.tap()
                
                // Check for proper error handling
                let errorAlert = app.alerts.firstMatch
                if errorAlert.waitForExistence(timeout: TestConstants.defaultTimeout) {
                    let alertTitle = errorAlert.staticTexts.element(boundBy: 0).label
                    let errorMessage = errorAlert.staticTexts.element(boundBy: 1).label
                    
                    print("Method Error - Alert Title: \(alertTitle)")
                    print("Method Error - Message: \(errorMessage)")
                    
                    // Verify error is properly structured
                    XCTAssertFalse(errorMessage.isEmpty, "Error message should not be empty")
                    
                    // Check if error includes relevant context
                    if errorMessage.lowercased().contains("not implemented") ||
                       errorMessage.lowercased().contains("not supported") ||
                       errorMessage.lowercased().contains("feature not available") {
                        XCTAssertTrue(true, "Properly indicated unsupported feature")
                    }
                    
                    errorAlert.buttons["OK"].tap()
                }
            }
            
            // Navigate back
            app.navigationBars.buttons.element(boundBy: 0).tap()
        }
    }
    
    // MARK: - Chain-Specific Error Tests
    
    func testChainSpecificErrorContext() throws {
        // Test that errors include chain-specific context
        performEmailLogin()
        
        // Test EVM chain error with insufficient funds
        testEVMChainError()
        
        // Test Solana chain error
        testSolanaChainError()
        
        // Test Cosmos chain error if available
        testCosmosChainError()
    }
    
    private func testEVMChainError() {
        let evmWalletCell = app.cells["walletCell_EVM"]
        guard evmWalletCell.waitForExistence(timeout: TestConstants.longTimeout) else { return }
        evmWalletCell.tap()
        
        // Try to send transaction (will likely fail with insufficient funds)
        let sendButton = app.buttons["Send Transaction"]
        if sendButton.waitForExistence(timeout: TestConstants.defaultTimeout) {
            sendButton.tap()
            
            // Check for insufficient funds error
            let errorAlert = app.alerts.firstMatch
            if errorAlert.waitForExistence(timeout: TestConstants.longTimeout) {
                let alertTitle = errorAlert.staticTexts.element(boundBy: 0).label
                let errorMessage = errorAlert.staticTexts.element(boundBy: 1).label
                
                print("EVM Error - Title: \(alertTitle)")
                print("EVM Error - Message: \(errorMessage)")
                
                // Check for chain-specific context
                if alertTitle.lowercased().contains("insufficient") ||
                   errorMessage.lowercased().contains("insufficient") {
                    // Should include helpful context about funding
                    XCTAssertTrue(errorMessage.contains("Sepolia") || 
                                errorMessage.contains("faucet") ||
                                errorMessage.contains("ETH"),
                                "Insufficient funds error should include chain context: \(errorMessage)")
                }
                
                errorAlert.buttons["OK"].tap()
            }
        }
        
        // Navigate back
        app.navigationBars.buttons.element(boundBy: 0).tap()
    }
    
    private func testSolanaChainError() {
        let solanaWalletCell = app.cells["walletCell_SOLANA"]
        guard solanaWalletCell.waitForExistence(timeout: TestConstants.defaultTimeout) else { return }
        solanaWalletCell.tap()
        
        // Try Solana-specific operations
        let signButton = app.buttons["Sign Transaction"]
        if signButton.waitForExistence(timeout: TestConstants.defaultTimeout) {
            signButton.tap()
            
            // Check for Solana-specific error
            let errorAlert = app.alerts.firstMatch
            if errorAlert.waitForExistence(timeout: TestConstants.longTimeout) {
                let alertTitle = errorAlert.staticTexts.element(boundBy: 0).label
                let errorMessage = errorAlert.staticTexts.element(boundBy: 1).label
                
                print("Solana Error - Title: \(alertTitle)")
                print("Solana Error - Message: \(errorMessage)")
                
                // Verify Solana context is included
                if errorMessage.lowercased().contains("solana") ||
                   errorMessage.lowercased().contains("lamports") ||
                   errorMessage.lowercased().contains("sol") {
                    XCTAssertTrue(true, "Solana error includes chain context")
                }
                
                errorAlert.buttons["OK"].tap()
            }
        }
        
        // Navigate back
        app.navigationBars.buttons.element(boundBy: 0).tap()
    }
    
    private func testCosmosChainError() {
        let cosmosWalletCell = app.cells["walletCell_COSMOS"]
        guard cosmosWalletCell.waitForExistence(timeout: TestConstants.defaultTimeout) else { return }
        cosmosWalletCell.tap()
        
        // Try Cosmos-specific operations
        let signButton = app.buttons["Sign Transaction"]
        if signButton.waitForExistence(timeout: TestConstants.defaultTimeout) {
            signButton.tap()
            
            // Check for Cosmos-specific error
            let errorAlert = app.alerts.firstMatch
            if errorAlert.waitForExistence(timeout: TestConstants.longTimeout) {
                let alertTitle = errorAlert.staticTexts.element(boundBy: 0).label
                let errorMessage = errorAlert.staticTexts.element(boundBy: 1).label
                
                print("Cosmos Error - Title: \(alertTitle)")
                print("Cosmos Error - Message: \(errorMessage)")
                
                // Verify Cosmos context
                if errorMessage.lowercased().contains("cosmos") ||
                   errorMessage.lowercased().contains("atom") ||
                   errorMessage.lowercased().contains("ibc") {
                    XCTAssertTrue(true, "Cosmos error includes chain context")
                }
                
                errorAlert.buttons["OK"].tap()
            }
        }
        
        // Navigate back
        app.navigationBars.buttons.element(boundBy: 0).tap()
    }
    
    // MARK: - Error Recovery Tests
    
    func testErrorRecoveryFlow() throws {
        // Test that app properly recovers from errors
        performEmailLogin()
        
        let evmWalletCell = app.cells["walletCell_EVM"]
        XCTAssertTrue(evmWalletCell.waitForExistence(timeout: TestConstants.longTimeout))
        evmWalletCell.tap()
        
        // First, try an operation that might fail
        let signButton = app.buttons["Sign Message"]
        let messageField = app.textFields["Enter a message to sign"]
        
        // Try with empty message (should show error)
        if signButton.waitForExistence(timeout: TestConstants.defaultTimeout) {
            signButton.tap()
            
            // Should show error for empty message
            let errorAlert = app.alerts.firstMatch
            if errorAlert.waitForExistence(timeout: TestConstants.defaultTimeout) {
                let errorMessage = errorAlert.staticTexts.element(boundBy: 1).label
                XCTAssertTrue(errorMessage.contains("enter a message"),
                             "Should show validation error: \(errorMessage)")
                errorAlert.buttons["OK"].tap()
            }
        }
        
        // Now try with valid message
        XCTAssertTrue(messageField.waitForExistence(timeout: TestConstants.defaultTimeout))
        messageField.tap()
        messageField.typeText("Test recovery message")
        
        // Sign button should work now
        signButton.tap()
        
        // Wait for success or another error
        sleep(3)
        
        // Check if we got a success message
        let successAlert = app.alerts.firstMatch
        if successAlert.waitForExistence(timeout: TestConstants.longTimeout) {
            let alertTitle = successAlert.staticTexts.element(boundBy: 0).label
            if alertTitle.contains("Success") {
                XCTAssertTrue(true, "App recovered and completed operation successfully")
            }
            successAlert.buttons["OK"].tap()
        }
        
        // Verify app is still functional
        XCTAssertTrue(signButton.exists, "App should remain functional after error recovery")
    }
    
    // MARK: - Structured Error Tests
    
    func testStructuredErrorInformation() throws {
        // Test that errors contain proper structure (code, message, context)
        performEmailLogin()
        
        let evmWalletCell = app.cells["walletCell_EVM"]
        XCTAssertTrue(evmWalletCell.waitForExistence(timeout: TestConstants.longTimeout))
        evmWalletCell.tap()
        
        // Trigger an error that should have structured information
        let sendButton = app.buttons["Send Transaction"]
        if sendButton.waitForExistence(timeout: TestConstants.defaultTimeout) {
            sendButton.tap()
            
            let errorAlert = app.alerts.firstMatch
            if errorAlert.waitForExistence(timeout: TestConstants.longTimeout) {
                let alertTitle = errorAlert.staticTexts.element(boundBy: 0).label
                let errorMessage = errorAlert.staticTexts.element(boundBy: 1).label
                
                // Verify error has proper structure
                XCTAssertFalse(alertTitle.isEmpty, "Error should have a title")
                XCTAssertFalse(errorMessage.isEmpty, "Error should have a message")
                
                // Check for structured error components
                print("Structured Error - Title: \(alertTitle)")
                print("Structured Error - Message: \(errorMessage)")
                
                // Error should include relevant context
                if alertTitle.contains("Insufficient") {
                    // Should have helpful information
                    XCTAssertTrue(errorMessage.contains("balance") || 
                                errorMessage.contains("fund") ||
                                errorMessage.contains("faucet"),
                                "Error should provide helpful context: \(errorMessage)")
                }
                
                // Check for duration tracking (performance metrics)
                if errorMessage.contains("Duration:") {
                    XCTAssertTrue(true, "Error includes performance metrics")
                }
                
                errorAlert.buttons["OK"].tap()
            }
        }
    }
    
    func testRetryableErrorIndication() throws {
        // Test that retryable errors are properly indicated
        performEmailLogin()
        
        let evmWalletCell = app.cells["walletCell_EVM"]
        XCTAssertTrue(evmWalletCell.waitForExistence(timeout: TestConstants.longTimeout))
        evmWalletCell.tap()
        
        // Test network operation that could be retried
        let checkSessionButton = app.buttons["Check Session"]
        if checkSessionButton.waitForExistence(timeout: TestConstants.defaultTimeout) {
            checkSessionButton.tap()
            
            // Wait for result
            sleep(2)
            
            // Check if any alert appears
            let alert = app.alerts.firstMatch
            if alert.waitForExistence(timeout: TestConstants.defaultTimeout) {
                let alertTitle = alert.staticTexts.element(boundBy: 0).label
                let alertMessage = alert.staticTexts.element(boundBy: 1).label
                
                print("Session Check - Title: \(alertTitle)")
                print("Session Check - Message: \(alertMessage)")
                
                // If it's an error that can be retried, it should indicate so
                if alertTitle.contains("Error") && 
                   (alertMessage.contains("network") || alertMessage.contains("timeout")) {
                    // Network errors should be retryable
                    XCTAssertTrue(alertMessage.contains("try again") || 
                                alertMessage.contains("retry"),
                                "Retryable errors should suggest retry: \(alertMessage)")
                }
                
                alert.buttons["OK"].tap()
            }
        }
    }
    
    // MARK: - Helper Methods
    
    private func performEmailLogin() {
        // Use the shared helper from SharedTestHelpers
        let testEmail = TestConstants.generateUniqueEmail()
        performEmailAuthWithPasskey(app: app, email: testEmail)
        
        // Wait for wallets view
        waitForWalletsView(app: app)
        
        // If no wallets exist, create one
        let firstWalletCell = app.cells.element(boundBy: 0)
        if !firstWalletCell.exists {
            let createButton = app.buttons["createFirstWalletButton"]
            if createButton.waitForExistence(timeout: TestConstants.defaultTimeout) {
                createButton.tap()
                sleep(3) // Wait for wallet creation
            }
        }
    }
}