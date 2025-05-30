import SwiftUI
import ParaSwift
import os

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
        }
    }
}

