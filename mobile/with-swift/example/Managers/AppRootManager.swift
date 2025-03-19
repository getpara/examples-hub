import Foundation

enum AppRoot {
    case launch
    case authentication
    case home
}

final class AppRootManager: ObservableObject {
    @Published var currentRoot: AppRoot = .launch
}
