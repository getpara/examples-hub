//
//  OAuthView.swift
//  example
//
//  Created by Brian Corbin on 2/9/25.
//

import SwiftUI
import ParaSwift
import AuthenticationServices

struct OAuthView: View {
    @EnvironmentObject var paraManager: ParaManager
    @EnvironmentObject var appRootManager: AppRootManager
    
    @Environment(\.openURL) private var openURL
    @Environment(\.authorizationController) private var authorizationController
    @Environment(\.webAuthenticationSession) private var webAuthenticationSession
    
    @State private var email = ""
    @State private var shouldNavigateToVerificationView = false
    @State private var error: Error?
    @State private var showError = false
    
    private func login(provider: OAuthProvider) {
        Task {
            do {
                let email = try await paraManager.oAuthConnect(provider: provider, webAuthenticationSession: webAuthenticationSession)
                handleLogin(email: email)
            } catch {
                self.error = error
            }
        }
    }
    
    private func handleLogin(email: String) {
        Task {
            self.email = email
            let userExists = try await paraManager.checkIfUserExists(email: email)
            if userExists {
                try await paraManager.login(authorizationController: authorizationController, authInfo: EmailAuthInfo(email: email))
                appRootManager.currentRoot = .home
            } else {
                try await paraManager.createUser(email: email)
                shouldNavigateToVerificationView = true
            }
        }
    }
    
    var body: some View {
        VStack {
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
        }
        .alert("Connection Error", isPresented: $showError) {
            Button("OK", role: .cancel) { }
        } message: {
            Text(error?.localizedDescription ?? "Unknown error occurred")
        }
        .navigationDestination(isPresented: $shouldNavigateToVerificationView) {
            VerifyEmailView(email: email)
                .environmentObject(paraManager)
                .environmentObject(appRootManager)
        }
        .padding()
        .navigationTitle("OAuth + Passkey")
    }
}

#Preview {
    OAuthView().environmentObject(ParaManager(environment: .sandbox, apiKey: "preview-key"))
        .environmentObject(AppRootManager())
}
