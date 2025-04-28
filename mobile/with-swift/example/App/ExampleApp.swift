import SwiftUI
import ParaSwift
import os

@main
struct ExampleApp: App {
    private let logger = Logger(subsystem: "com.usecapsule.example.swift", category: "ExampleApp")
    @StateObject private var paraManager: ParaManager
    @StateObject private var paraEvmSigner: ParaEvmSigner
    @StateObject private var appRootManager = AppRootManager()
    @StateObject private var metaMaskConnector: MetaMaskConnector
    
    init() {
        // Load Para configuration
        let config = ParaConfig.fromEnvironment()
        let bundleId = Bundle.main.bundleIdentifier ?? ""
        
        // Initialize Para manager
        let paraManager = ParaManager(environment: config.environment, apiKey: config.apiKey)
        _paraManager = StateObject(wrappedValue: paraManager)
        
        // Initialize EVM signer
        do {
            let signer = try ParaEvmSigner(paraManager: paraManager, rpcUrl: config.rpcUrl, walletId: nil)
            _paraEvmSigner = StateObject(wrappedValue: signer)
        } catch {
            fatalError("Failed to initialize Para EVM signer: \(error)")
        }
        
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
                        .environmentObject(paraEvmSigner)
                        .environmentObject(metaMaskConnector)
                }
            }
            .onOpenURL { url in
                logger.debug("Received deep link URL: \(url.absoluteString)")
                metaMaskConnector.handleURL(url)
            }
//             .onChange(of: paraManager.sessionState) { newState in
//                 switch newState {
//                 case .activeLoggedIn:
//                     appRootManager.currentRoot = .home
//                 case .inactive:
//                     appRootManager.currentRoot = .authentication
//                 case .active:
//                     // Handle partially active state if needed
//                     appRootManager.currentRoot = .authentication
//                 case .unknown:
//                     // Keep showing launch view until we know the state
//                     break
//                 }
//             }
//            .task {
//                // Add a minimum delay to show launch screen
//                try? await Task.sleep(nanoseconds: 1_000_000_000) // 1 second
//                
//                // If we're still in launch state after the delay and session state is known,
//                // transition to the appropriate screen
//                if appRootManager.currentRoot == .launch && paraManager.sessionState != .unknown {
//                    appRootManager.currentRoot = paraManager.sessionState == .activeLoggedIn ? .home : .authentication
//                }
//            }
        }
    }
}

