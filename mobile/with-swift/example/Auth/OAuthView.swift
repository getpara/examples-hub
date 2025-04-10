//
//  OAuthView.swift
//  example
//
//  Created by Brian Corbin on 2/9/25.
//

import SwiftUI
import ParaSwift
import AuthenticationServices
import os

struct OAuthView: View {
    @EnvironmentObject var paraManager: ParaManager
    @EnvironmentObject var appRootManager: AppRootManager
    
    @Environment(\.openURL) private var openURL
    @Environment(\.authorizationController) private var authorizationController
    @Environment(\.webAuthenticationSession) private var webAuthenticationSession
    
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var showError = false
    @State private var debugInfo: String?
    
    private let logger = Logger(subsystem: "com.example", category: "OAuthView")
    
    private func login(provider: OAuthProvider) {
        isLoading = true
        errorMessage = nil
        debugInfo = "Starting OAuth flow for provider: \(provider.rawValue)"
        
        Task {
            do {
                logger.debug("Initiating OAuth flow for provider: \(provider.rawValue)")
                
                // Use the new verifyOAuth method
                let authState = try await paraManager.verifyOAuth(provider: provider, webAuthenticationSession: webAuthenticationSession)
                
                logger.debug("Received auth state with stage: \(authState.stage.rawValue)")
                debugInfo = "Auth state received: \(authState.stage.rawValue)"
                
                // Handle the auth state based on the stage
                switch authState.stage {
                case .login:
                    logger.debug("Processing login stage")
                    // Existing user, handle login
                    if let passkeyUrl = authState.passkeyUrl {
                        logger.debug("Using passkey URL for login")
                        try await paraManager.login(authorizationController: authorizationController, authInfo: nil)
                        appRootManager.currentRoot = .home
                    } else {
                        logger.error("No passkey URL available for login")
                        errorMessage = "No authentication method available"
                    }
                case .signup:
                    logger.debug("Processing signup stage")
                    // New user, handle signup
                    if let passkeyId = authState.passkeyId {
                        logger.debug("Generating passkey with ID: \(passkeyId)")
                        try await paraManager.generatePasskey(
                            identifier: authState.userId,
                            biometricsId: passkeyId,
                            authorizationController: authorizationController
                        )
                        logger.debug("Creating wallet")
                        try await paraManager.createWallet(type: .evm, skipDistributable: false)
                        appRootManager.currentRoot = .home
                    } else if let passwordUrl = authState.passwordUrl {
                        logger.debug("Using password URL for signup")
                        // In a real app, you would open this URL in a new window
                        // For this example, we'll just create a wallet directly
                        try await paraManager.createWallet(type: .evm, skipDistributable: false)
                        appRootManager.currentRoot = .home
                    } else {
                        logger.error("No authentication method available for signup")
                        errorMessage = "No authentication method available"
                    }
                case .verify:
                    logger.error("Unexpected verify stage for OAuth")
                    // This shouldn't happen with OAuth
                    errorMessage = "Unexpected authentication stage"
                }
            } catch {
                logger.error("OAuth error: \(error.localizedDescription)")
                errorMessage = String(describing: error)
            }
            
            isLoading = false
        }
    }
    
    var body: some View {
        VStack {
            if isLoading {
                ProgressView("Processing...")
                    .padding()
            }
            
            if let errorMessage = errorMessage {
                Text(errorMessage)
                    .foregroundColor(.red)
                    .multilineTextAlignment(.center)
                    .padding()
            }
            
            if let debugInfo = debugInfo {
                Text(debugInfo)
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                    .padding()
            }
            
            Button {
                login(provider: .google)
            } label: {
                HStack(spacing: 15) {
                    Image(.google)
                        .resizable()
                        .frame(width: 24, height: 24)
                    Text("Login with Google")
                        .fontWeight(.semibold)
                }
                .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
            .controlSize(.large)
            .tint(.primary)
            .foregroundStyle(.background)
            .accessibilityIdentifier("googleOAuthButton")
            .disabled(isLoading)
            
            Button {
                login(provider: .discord)
            } label: {
                HStack(spacing: 15) {
                    Image(.discord)
                        .resizable()
                        .frame(width: 24, height: 20)
                    Text("Login with Discord")
                        .fontWeight(.semibold)
                }
                .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
            .controlSize(.large)
            .tint(Color(uiColor: UIColor(rgb: 0x5865F2)))
            .disabled(isLoading)
            
            Button {
                login(provider: .apple)
            } label: {
                HStack(spacing: 15) {
                    Image(.apple)
                        .resizable()
                        .frame(width: 24, height: 24)
                    Text("Login with Apple")
                        .fontWeight(.semibold)
                }
                .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
            .controlSize(.large)
            .disabled(isLoading)
        }
        .padding()
        .navigationTitle("OAuth + Passkey")
    }
}

#Preview {
    OAuthView().environmentObject(ParaManager(environment: .sandbox, apiKey: "preview-key"))
        .environmentObject(AppRootManager())
}
