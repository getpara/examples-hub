import os
import ParaSwift
import SwiftUI

@main
struct ExampleApp: App {
    @StateObject private var paraManager: ParaManager
    @StateObject private var appRootManager = AppRootManager()

    init() {
        // Para Configuration
        let config = ParaConfig(
            apiKey: "12e3517d125169ea9847d0da5bdcd9c9", // Get from: http://developer.getpara.com
            environment: .sandbox,
        )

        // Para app scheme for deep linking
        let appScheme = "paraswift"

        // Initialize Para manager
        let paraManager = ParaManager(
            environment: config.environment,
            apiKey: config.apiKey,
            appScheme: appScheme,
        )
        _paraManager = StateObject(wrappedValue: paraManager)
    }

    var body: some Scene {
        WindowGroup {
            Group {
                switch appRootManager.currentRoot {
                case .launch:
                    LaunchView()
                case .authentication:
                    AuthView()
                        .environmentObject(paraManager)
                        .environmentObject(appRootManager)
                case .home:
                    WalletsView()
                        .environmentObject(paraManager)
                        .environmentObject(appRootManager)
                }
            }
            .onOpenURL { url in
                // Handle MetaMask deep links
                if url.scheme == "paraswift", url.host == "mmsdk" {
                    MetaMaskConnector.handleDeepLink(url)
                }
            }
            .onAppear {
                // Validate stored authentication session on app launch
                validateStoredSession()
            }
        }
    }

    private func validateStoredSession() {
        // If app thinks user is authenticated, validate with Para SDK
        if appRootManager.currentRoot == .home {
            Task {
                do {
                    // Try to fetch wallets to validate session
                    let _ = try await paraManager.fetchWallets()
                } catch {
                    // Invalid session, force logout
                    await MainActor.run {
                        appRootManager.setAuthenticated(false)
                    }
                }
            }
        }
    }
}
