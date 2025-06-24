import os
import ParaSwift
import SwiftUI

@main
struct ExampleApp: App {
    private let logger = Logger(subsystem: "com.usecapsule.example.swift", category: "ExampleApp")
    @StateObject private var paraManager: ParaManager
    @StateObject private var appRootManager = AppRootManager()
    @StateObject private var metaMaskConnector: MetaMaskConnector

    init() {
        // Load Para configuration
        let config = ParaConfig.fromEnvironment()
        let bundleId = Bundle.main.bundleIdentifier ?? ""

        logger.info("Initializing with environment: \(config.environment.name), API key: \(String(config.apiKey.prefix(8)))...")

        // Initialize Para manager
        let paraManager = ParaManager(environment: config.environment, apiKey: config.apiKey, deepLink: bundleId)
        _paraManager = StateObject(wrappedValue: paraManager)

        // Initialize MetaMask Connector with configuration
        let metaMaskConfig = MetaMaskConfig(appName: "ExampleApp", appId: bundleId, apiVersion: "1.0")
        let metaMaskConnector = MetaMaskConnector(para: paraManager, appUrl: "https://\(bundleId)", config: metaMaskConfig)
        _metaMaskConnector = StateObject(wrappedValue: metaMaskConnector)
    }

    var body: some Scene {
        WindowGroup {
            Group {
                switch appRootManager.currentRoot {
                case .launch:
                    LaunchView()
                case .authentication:
                    AuthOptionsView()
                        .environmentObject(paraManager)
                        .environmentObject(appRootManager)
                        .environmentObject(metaMaskConnector)
                case .home:
                    WalletsView()
                        .environmentObject(paraManager)
                        .environmentObject(appRootManager)
                        .environmentObject(metaMaskConnector)
                }
            }
            .onOpenURL { url in
                logger.debug("Received deep link URL: \(url.absoluteString)")
                metaMaskConnector.handleURL(url)
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
                    logger.info("Session validation successful")
                } catch {
                    logger.warning("Session validation failed: \(error.localizedDescription)")
                    // Invalid session, force logout
                    await MainActor.run {
                        appRootManager.setAuthenticated(false)
                    }
                }
            }
        }
    }
}
