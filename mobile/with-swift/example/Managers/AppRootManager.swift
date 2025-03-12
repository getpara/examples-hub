import Foundation

enum AppRoot {
    case authentication
    case home
}

final class AppRootManager: ObservableObject {
    @Published var currentRoot: AppRoot = .authentication
}
