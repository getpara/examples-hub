//
//  ASWebAuthConsent.swift
//  ExampleUITests
//

import XCTest

/// Install a short-lived monitor for ASWebAuthenticationSession consent.
extension XCTestCase {
    @discardableResult
    func installASWebAuthConsentMonitor() -> NSObjectProtocol {
        addUIInterruptionMonitor(withDescription: "ASWebAuth consent") { element in
            if element.buttons["Continue"].firstMatch.exists {
                return element.buttons["Continue"].firstMatch.robustTap()
            }

            let authUI = XCUIApplication(bundleIdentifier: "com.apple.AuthenticationServicesUI")
            let authContinue = authUI.buttons["Continue"].firstMatch
            if authContinue.exists {
                return authContinue.robustTap()
            }

            let springboard = XCUIApplication(bundleIdentifier: "com.apple.springboard")
            let springboardContinue = springboard.buttons["Continue"].firstMatch
            if springboardContinue.exists {
                return springboardContinue.robustTap()
            }

            return Self.bruteforceRightButtonTap(in: authUI)
                || Self.bruteforceRightButtonTap(in: springboard)
        }
    }

    /// Bottom sheet “right button” geometric tap. Helpful when no elements are exposed.
    static func bruteforceRightButtonTap(in host: XCUIApplication) -> Bool {
        let window = host.windows.firstMatch
        guard window.exists else { return false }

        let candidates: [CGVector] = [
            CGVector(dx: 0.75, dy: 0.82),
            CGVector(dx: 0.80, dy: 0.86),
            CGVector(dx: 0.70, dy: 0.88),
        ]

        for target in candidates {
            window.coordinate(withNormalizedOffset: target).tap()
            return true
        }

        return false
    }
}
