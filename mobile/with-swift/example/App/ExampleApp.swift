import os
import ParaSwift
import SwiftUI

@main
struct ExampleApp: App {
    private let configuration: Result<ParaConfig, Error>

    init() {
        configuration = Result { try ParaConfig() }
    }

    var body: some Scene {
        WindowGroup {
            switch configuration {
            case let .success(config):
                ConfiguredExampleRoot(config: config)
            case let .failure(error):
                ConfigurationErrorView(message: error.localizedDescription)
            }
        }
    }
}

private struct ConfiguredExampleRoot: View {
    @StateObject private var paraManager: ParaManager
    @StateObject private var appRootManager = AppRootManager()

    init(config: ParaConfig) {
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

    var body: some View {
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

private struct ConfigurationErrorView: View {
    let message: String

    var body: some View {
        VStack(spacing: 12) {
            Image(systemName: "wrench.and.screwdriver")
                .font(.largeTitle)
            Text("Configure the Para example")
                .font(.headline)
            Text(message)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
            Text("Create example/Secrets.xcconfig from Config.xcconfig, select it for Debug, then rebuild the app.")
                .font(.footnote)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding(24)
    }
}
