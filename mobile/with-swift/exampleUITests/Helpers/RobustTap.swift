//
//  RobustTap.swift
//  ExampleUITests
//

import XCTest

extension XCUIElement {
    /// Tap if possible. If not hittable, fall back to a coordinate tap at the element's center.
    /// Returns true if a tap was synthesized.
    @discardableResult
    func robustTap(timeout: TimeInterval = 0.0, file: StaticString = #file, line: UInt = #line) -> Bool {
        _ = file
        _ = line
        guard waitForExistence(timeout: timeout) else { return false }
        if isHittable {
            tap()
            return true
        }
        let center = coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.5))
        center.tap()
        return true
    }
}

extension XCUIApplication {
    /// Nudge to allow UI interruption monitors to fire.
    func nudgeForInterruptionHandling() {
        tap()
    }
}
