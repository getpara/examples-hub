//
//  AuthenticationUITests.swift
//  ParaOneClickLoginUITests
//
//  Happy path test for email one-click login flow
//

import XCTest

class AuthenticationUITests: XCTestCase {
    let app = XCUIApplication()

    override func setUpWithError() throws {
        continueAfterFailure = false
        app.launch()
    }

    func testEmailOneClickLogin() throws {
        let testEmail = TestConstants.generateUniqueEmail()
        performOneClickAuthentication(app: app, credential: testEmail)
    }
}
