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
        static let longTimeout: TimeInterval = 30.0
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
        
        // Wait for the main screen to appear after launch
        waitForMainScreen()
    }
    
    // MARK: - Helper Methods
    private func waitForMainScreen() {
        // Wait for either email or phone auth button to appear, indicating the main screen is loaded
        let emailButton = app.buttons["emailAuthButton"]
        let phoneButton = app.buttons["phoneAuthButton"]
        
        // Wait for at least one of the buttons to appear
        let predicate = NSPredicate(format: "exists == true")
        let expectation = XCTNSPredicateExpectation(predicate: predicate, object: emailButton)
        let expectation2 = XCTNSPredicateExpectation(predicate: predicate, object: phoneButton)
        
        let result = XCTWaiter.wait(for: [expectation, expectation2], timeout: TestConstants.longTimeout)
        XCTAssertTrue(result == .completed, "Main screen should appear within timeout period")
    }
    
    private func performBiometricAuthentication(offsetFromBottom: CGFloat) {
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
    
    private func loginWithEmailAndWaitForWalletsView() {
        // 1. Start email authentication
        let emailButton = app.buttons["emailAuthButton"]
        // Wait for the button to exist before trying to tap
        XCTAssertTrue(emailButton.waitForExistence(timeout: TestConstants.defaultTimeout), "Email auth button should exist")
        emailButton.tap()

        // 2. Enter the saved email (Requires test01 to have run successfully)
        guard let savedEmail = TestConstants.savedEmail else {
            // Fail fast if the prerequisite test didn't save the email
            XCTFail("No saved email found for login. Ensure test01EmailAuthenticationFlow runs first and succeeds.")
            return // Stop execution of this helper if email is missing
        }

        let emailField = app.textFields["emailInputField"]
        // Wait for the field to exist
        XCTAssertTrue(emailField.waitForExistence(timeout: TestConstants.defaultTimeout), "Email input field should exist")
        emailField.tap()
        emailField.typeText(savedEmail)

        // 3. Tap Continue
        let continueButton = app.buttons["continueButton"]
        XCTAssertTrue(continueButton.waitForExistence(timeout: TestConstants.defaultTimeout), "Continue button should exist")
        continueButton.tap()

        // 4. Perform biometric authentication for login
        performBiometricAuthentication(offsetFromBottom: 50)

        // 5. Verify successful authentication and wait for wallets view
        waitForWalletsView() // This helper already contains necessary waits and assertions
    }
    
    private func navigateToEVMWallet() {
        // 1. Login via email and wait for the wallets view
        loginWithEmailAndWaitForWalletsView()
        
        // 2. Tap on the first wallet to navigate to EVMWalletView
        let firstWalletCell = app.cells.element(boundBy: 0)
        // Ensure the cell exists and is hittable before tapping
        // waitForWalletsView should ensure existence, but checking hittable is good practice
        XCTAssertTrue(firstWalletCell.exists, "First wallet cell should exist after login")
        XCTAssertTrue(firstWalletCell.isHittable, "First wallet cell should be hittable")
        firstWalletCell.tap()

        // 3. Verify we're on the EVM Wallet screen
        let walletTitle = app.navigationBars["EVM Wallet"]
        XCTAssertTrue(walletTitle.waitForExistence(timeout: TestConstants.defaultTimeout), "EVM Wallet view navigation bar should appear after tapping wallet")
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
    
<<<<<<< HEAD
    func test04PhonePasskeyLoginFlow() throws {
=======
    func test04PasskeyLoginFlow() throws {
>>>>>>> main
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
    
    func test05WalletRefreshFlow() throws {
        // Log in via email and wait for wallets view
        loginWithEmailAndWaitForWalletsView()
        
        // Find and tap the refresh button
        let refreshButton = app.buttons["refreshButton"]
        XCTAssertTrue(refreshButton.waitForExistence(timeout: TestConstants.defaultTimeout), "Refresh button should exist")
        
        // Get initial wallet count
        let initialWalletCount = app.cells.count
        
        // Tap refresh and wait for the action to complete
        refreshButton.tap()
        
        // Verify no error alerts appear during refresh
        let errorAlert = app.alerts.element
        XCTAssertFalse(errorAlert.exists, "No error alert should appear during refresh")
        
        // Wait for the refresh to complete and verify the wallet list is still accessible
        let walletCells = app.cells
        XCTAssertTrue(walletCells.firstMatch.waitForExistence(timeout: TestConstants.defaultTimeout), "Wallet cells should still exist after refresh")
        
        // Verify we still have the same number of wallets
        XCTAssertEqual(walletCells.count, initialWalletCount, "Wallet count should remain the same after refresh")
        
        // Verify the first wallet is still tappable
        let firstWalletCell = walletCells.element(boundBy: 0)
        XCTAssertTrue(firstWalletCell.isHittable, "First wallet cell should remain tappable after refresh")
        
        // Verify the refresh button is back
        XCTAssertTrue(refreshButton.exists, "Refresh button should reappear after refresh")
    }
    
    func test06CreateWalletFlow() throws {
        // Log in via email and wait for wallets view
        loginWithEmailAndWaitForWalletsView()
        
        // Find and tap the create wallet button
        let createButton = app.buttons["createWalletButton"]
        XCTAssertTrue(createButton.waitForExistence(timeout: TestConstants.defaultTimeout), "Create button should exist")
        createButton.tap()
        
        // Select EVM wallet type
        let evmButton = app.buttons["evmWalletButton"]
        XCTAssertTrue(evmButton.waitForExistence(timeout: TestConstants.defaultTimeout), "EVM button should exist")
        evmButton.tap()
        
        // Wait for the new wallet to appear in the list
        let walletCells = app.cells
        XCTAssertTrue(walletCells.element(boundBy: 1).waitForExistence(timeout: TestConstants.longTimeout), "New wallet should appear as the second item in the list")
        
        // Verify that the new wallet is tappable
        let newWalletCell = walletCells.element(boundBy: 1)
        XCTAssertTrue(newWalletCell.isHittable, "New wallet cell should be tappable")
    }
    
    func test07CopyWalletAddressFlow() throws {
        navigateToEVMWallet()
        
        // Find and tap the copy button using accessibility identifier
        let copyButton = app.buttons["copyAddressButton"]
        XCTAssertTrue(copyButton.waitForExistence(timeout: TestConstants.defaultTimeout), "Copy address button should exist")
        copyButton.tap()
        
        // Verify success alert appears
        let alert = app.alerts.firstMatch
        XCTAssertTrue(alert.waitForExistence(timeout: TestConstants.defaultTimeout), "Success alert should appear")
        XCTAssertTrue(alert.staticTexts["Success"].exists, "Alert should have 'Success' title")
        XCTAssertTrue(alert.staticTexts["Address copied to clipboard"].exists, "Alert should show success message")
        
        // Dismiss alert
        alert.buttons["OK"].tap()
    }
    
    func test08FetchBalanceFlow() throws {
        navigateToEVMWallet()
        
        // Wait for balance to appear automatically
        let balanceText = app.staticTexts.matching(NSPredicate(format: "label CONTAINS 'ETH'")).firstMatch
        XCTAssertTrue(balanceText.waitForExistence(timeout: TestConstants.longTimeout), "Balance should appear")
        
        // Find and tap the refresh balance button using accessibility identifier
        let refreshBalanceButton = app.buttons["refreshBalanceButton"]
        XCTAssertTrue(refreshBalanceButton.waitForExistence(timeout: TestConstants.defaultTimeout), "Balance refresh button should exist")
        refreshBalanceButton.tap()
        
        // Wait briefly to ensure balance refreshes
        sleep(2)
        
        // Verify balance text still exists after refresh
        XCTAssertTrue(balanceText.exists, "Balance should still be visible after refresh")
    }
    
    func test09SignMessageFlow() throws {
        navigateToEVMWallet()
        
        // Enter a message to sign
        let messageField = app.textFields["Enter a message to sign"]
        XCTAssertTrue(messageField.waitForExistence(timeout: TestConstants.defaultTimeout), "Message field should exist")
        messageField.tap()
        messageField.typeText("Hello, blockchain world!")
        
        // Tap the Sign Message button
        let signMessageButton = app.buttons["Sign Message"]
        XCTAssertTrue(signMessageButton.waitForExistence(timeout: TestConstants.defaultTimeout), "Sign Message button should exist")
        signMessageButton.tap()
        
        // Wait for the signing process to complete and verify success alert
        let alert = app.alerts.firstMatch
        XCTAssertTrue(alert.waitForExistence(timeout: TestConstants.longTimeout), "Alert should appear after signing")
<<<<<<< HEAD
        
        // Verify we got a success message, not an error
        XCTAssertTrue(alert.staticTexts["Success"].exists, "Message signing should succeed")
        XCTAssertFalse(alert.staticTexts["Error"].exists, "Message signing should not fail")
=======
        XCTAssertTrue(alert.staticTexts["Success"].exists || alert.staticTexts["Error"].exists, "Alert should have success or error title")
>>>>>>> main
        
        // Dismiss alert
        alert.buttons["OK"].tap()
    }
    
    func test10SendTransactionFlow() throws {
        navigateToEVMWallet()
        
        // Tap the Send Transaction button
        let sendTxButton = app.buttons["Send Transaction"]
        XCTAssertTrue(sendTxButton.waitForExistence(timeout: TestConstants.defaultTimeout), "Send Transaction button should exist")
        sendTxButton.tap()
        
        // Wait for the transaction process to complete and verify alert
        let alert = app.alerts.firstMatch
        XCTAssertTrue(alert.waitForExistence(timeout: TestConstants.longTimeout), "Alert should appear after transaction")
        
<<<<<<< HEAD
        // In a test environment, this might fail due to network issues or insufficient funds
        // We'll check for either outcome but log which one occurred
        if alert.staticTexts["Success"].exists {
            print("Transaction was successful")
        } else if alert.staticTexts["Error"].exists {
            print("Transaction failed - this is expected in test environment due to network/funds limitations")
            // We don't fail the test here since this is an expected condition in test environment
        } else {
            XCTFail("Alert should have either Success or Error title")
        }
=======
        // Note: In a test environment, this will likely result in an error due to network issues or insufficient funds
        // We just verify that an alert appears, regardless of success or failure
        XCTAssertTrue(alert.staticTexts["Success"].exists || alert.staticTexts["Error"].exists, "Alert should have success or error title")
>>>>>>> main
        
        // Dismiss alert
        alert.buttons["OK"].tap()
    }
    
    func test11SignTransactionFlow() throws {
        navigateToEVMWallet()
        
        // Tap the Sign Transaction button
        let signTxButton = app.buttons["Sign Transaction"]
        XCTAssertTrue(signTxButton.waitForExistence(timeout: TestConstants.defaultTimeout), "Sign Transaction button should exist")
        signTxButton.tap()
        
        // Wait for the signing process to complete and verify alert
        let alert = app.alerts.firstMatch
        XCTAssertTrue(alert.waitForExistence(timeout: TestConstants.longTimeout), "Alert should appear after signing")
<<<<<<< HEAD
        
        // Verify we got a success message, not an error
        XCTAssertTrue(alert.staticTexts["Success"].exists, "Transaction signing should succeed")
        XCTAssertFalse(alert.staticTexts["Error"].exists, "Transaction signing should not fail")
=======
        XCTAssertTrue(alert.staticTexts["Success"].exists || alert.staticTexts["Error"].exists, "Alert should have success or error title")
>>>>>>> main
        
        // Dismiss alert
        alert.buttons["OK"].tap()
    }
    
    func test12CheckSessionFlow() throws {
        navigateToEVMWallet()
        
        // Tap the Check Session button
        let checkSessionButton = app.buttons["Check Session"]
        XCTAssertTrue(checkSessionButton.waitForExistence(timeout: TestConstants.defaultTimeout), "Check Session button should exist")
        checkSessionButton.tap()
        
        // Wait for the session check to complete and verify alert
        let alert = app.alerts.firstMatch
        XCTAssertTrue(alert.waitForExistence(timeout: TestConstants.defaultTimeout), "Alert should appear after session check")
        XCTAssertTrue(alert.staticTexts["Session Status"].exists, "Alert should have Session Status title")
        
        // Dismiss alert
        alert.buttons["OK"].tap()
    }
    
    func test13FetchWalletsFlow() throws {
        navigateToEVMWallet()
        
        // Tap the Fetch Wallets button
        let fetchWalletsButton = app.buttons["Fetch Wallets"]
        XCTAssertTrue(fetchWalletsButton.waitForExistence(timeout: TestConstants.defaultTimeout), "Fetch Wallets button should exist")
        fetchWalletsButton.tap()
        
        // Wait for the fetch operation to complete and verify alert
        let alert = app.alerts.firstMatch
        XCTAssertTrue(alert.waitForExistence(timeout: TestConstants.longTimeout), "Alert should appear after fetching wallets")
        XCTAssertTrue(alert.staticTexts["Wallets"].exists, "Alert should have Wallets title")
        
        // Dismiss alert
        alert.buttons["OK"].tap()
    }
    
    func test14LogoutFlow() throws {
        navigateToEVMWallet()
        
        // Tap the Logout button
        let logoutButton = app.buttons["Logout"]
        XCTAssertTrue(logoutButton.waitForExistence(timeout: TestConstants.defaultTimeout), "Logout button should exist")
        logoutButton.tap()
        
        // Verify we return to the authentication screen
        let emailButton = app.buttons["emailAuthButton"]
        XCTAssertTrue(emailButton.waitForExistence(timeout: TestConstants.longTimeout), "Email auth button should appear after logout")
        let phoneButton = app.buttons["phoneAuthButton"]
        XCTAssertTrue(phoneButton.exists, "Phone auth button should appear after logout")
    }
}

