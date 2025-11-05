//
//  ASWebAuthConsentMonitor.swift
//  ExampleUITests
//

import XCTest

/// Installs a short-lived monitor for the ASWebAuthenticationSession consent.
/// Call right before tapping your in-app "Continue", and remove afterwards.
extension XCTestCase {
    func installASWebAuthConsentMonitor() -> NSObjectProtocol {
        addUIInterruptionMonitor(withDescription: "ASWebAuth consent") { element in
            // 1) If XCTest handed us the dialog element (alert or sheet), try "Continue" there.
            let continueButton = element.buttons["Continue"].firstMatch
            if continueButton.exists {
                continueButton.tap()
                return true
            }

            // 2) Some OS builds host the consent as a sheet in this process.
            let authUI = XCUIApplication(bundleIdentifier: "com.apple.AuthenticationServicesUI")
            let authContinue = authUI.buttons["Continue"].firstMatch
            if authContinue.exists && authContinue.isHittable {
                authContinue.tap()
                return true
            }

            // 3) Rare fallback: SpringBoard-hosted alert.
            let springboard = XCUIApplication(bundleIdentifier: "com.apple.springboard")
            let springboardContinue = springboard.buttons["Continue"].firstMatch
            if springboardContinue.exists && springboardContinue.isHittable {
                springboardContinue.tap()
                return true
            }

            return false
        }
    }
}

extension XCUIApplication {
    /// Taps a neutral spot to trigger interruption monitors without activating UI controls.
    func nudgeForInterruptionHandling() {
        let window = windows.firstMatch
        if window.exists {
            let neutralPoint = window.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.02))
            neutralPoint.tap()
        } else {
            tap()
        }
    }
}

extension XCUIElement {
    /// Small utility to avoid animation/keyboard races.
    @discardableResult
    func waitToBeHittable(timeout: TimeInterval) -> Bool {
        let predicate = NSPredicate(format: "exists == true && hittable == true")
        let expectation = XCTNSPredicateExpectation(predicate: predicate, object: self)
        return XCTWaiter.wait(for: [expectation], timeout: timeout) == .completed
    }
}
