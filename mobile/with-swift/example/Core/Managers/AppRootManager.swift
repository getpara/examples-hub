import Foundation
import SwiftUI

enum AppRoot {
    case launch
    case authentication
    case home
}

final class AppRootManager: ObservableObject {
    @AppStorage("isAuthenticated") private var isAuthenticated = false

    @Published var currentRoot: AppRoot = .launch

    init() {
        // Set initial state based on stored authentication
        currentRoot = isAuthenticated ? .home : .authentication
    }

    func setAuthenticated(_ authenticated: Bool) {
        isAuthenticated = authenticated
        currentRoot = authenticated ? .home : .authentication
    }
}
