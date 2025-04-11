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
            // Use the new handleOAuth method that encapsulates the entire flow
            let result = await paraManager.handleOAuth(
                provider: provider,
                webAuthenticationSession: webAuthenticationSession,
                authorizationController: authorizationController
            )
            
            if result.success {
                logger.debug("OAuth authentication successful")
                debugInfo = "Authentication successful"
                appRootManager.currentRoot = .home
            } else {
                logger.error("OAuth error: \(result.errorMessage ?? "Unknown error")")
                errorMessage = result.errorMessage
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
