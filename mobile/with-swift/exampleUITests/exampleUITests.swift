//
//  ExampleUITests.swift
//  ExampleUITests
//
//  Created by Tyson Williams on 3/10/25.
//

import XCTest

class ExampleUITests: XCTestCase {
    let app = XCUIApplication()
    
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
    
    func testInitialAuthenticationView() throws {
        // Test that we start with the authentication view
        let authView = app.otherElements["authenticationView"]
        XCTAssertTrue(authView.exists, "Authentication view should be visible on app launch")
        
        // Verify navigation title
        XCTAssertTrue(app.navigationBars["Authentication"].exists)
    }
    
    func testAuthenticationOptions() throws {
        // Test that all authentication options are present
        let emailButton = app.buttons["emailAuthButton"]
        let phoneButton = app.buttons["phoneAuthButton"]
        let oauthButton = app.buttons["oauthAuthButton"]
        let walletButton = app.buttons["externalWalletButton"]
        
        XCTAssertTrue(emailButton.exists, "Email authentication option should be visible")
        XCTAssertTrue(phoneButton.exists, "Phone authentication option should be visible")
        XCTAssertTrue(oauthButton.exists, "OAuth authentication option should be visible")
        XCTAssertTrue(walletButton.exists, "External wallet option should be visible")
    }
    
    func testEmailAuthNavigation() throws {
        // Test navigation to email authentication
        let emailButton = app.buttons["emailAuthButton"]
        XCTAssertTrue(emailButton.exists)
        emailButton.tap()
        
        // Add verification for email auth view once you add identifiers to that view
        // let emailAuthView = app.otherElements["emailAuthView"]
        // XCTAssertTrue(emailAuthView.exists, "Should navigate to email authentication view")
    }
    
    func testPhoneAuthNavigation() throws {
        // Test navigation to phone authentication
        let phoneButton = app.buttons["phoneAuthButton"]
        XCTAssertTrue(phoneButton.exists)
        phoneButton.tap()
        
        // Add verification for phone auth view once you add identifiers to that view
        // let phoneAuthView = app.otherElements["phoneAuthView"]
        // XCTAssertTrue(phoneAuthView.exists, "Should navigate to phone authentication view")
    }
    
    func testOAuthAuthNavigation() throws {
        // Test navigation to OAuth authentication
        let oauthButton = app.buttons["oauthAuthButton"]
        XCTAssertTrue(oauthButton.exists)
        oauthButton.tap()
        
        // Add verification for OAuth auth view once you add identifiers to that view
        // let oauthAuthView = app.otherElements["oauthAuthView"]
        // XCTAssertTrue(oauthAuthView.exists, "Should navigate to OAuth authentication view")
    }
    
    func testExternalWalletAuthNavigation() throws {
        // Test navigation to external wallet authentication
        let walletButton = app.buttons["externalWalletButton"]
        XCTAssertTrue(walletButton.exists)
        walletButton.tap()
        
        // Add verification for wallet auth view once you add identifiers to that view
        // let walletAuthView = app.otherElements["walletAuthView"]
        // XCTAssertTrue(walletAuthView.exists, "Should navigate to external wallet authentication view")
    }
}

