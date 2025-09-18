//
//  AuthView.swift
//  example
//
//  Created by Tyson Williams on 6/27/25.
//

import Combine
import ParaSwift
import SwiftUI

struct AuthView: View {
    /// Main Para SDK manager for authentication operations
    @EnvironmentObject var paraManager: ParaManager
    /// Manages app navigation and authentication state
    @EnvironmentObject var appRootManager: AppRootManager

    /// System URL opener for external links
    @Environment(\.openURL) private var openURL
    /// Controller for passkey/biometric authentication operations
    @Environment(\.authorizationController) private var authorizationController
    /// Session manager for OAuth provider web authentication flows
    @Environment(\.webAuthenticationSession) private var webAuthenticationSession

    @State private var showOTP = false
    @State private var showErrorAlert = false
    @State private var errorMessage = ""
    @State private var currentAuthState: AuthState?
    @State private var showWalletSelection = false
    @State private var loadingProvider: OAuthProvider?

    @FocusState private var textFieldFocus: Bool

    var body: some View {
        VStack(spacing: 0) {
            Spacer()

            Image(.paraLogo)
                .resizable()
                .frame(width: 85, height: 85)

            Spacer()

            Text("Sign Up or Log In")
                .font(.title2)
                .fontWeight(.semibold)
                .foregroundColor(.black)
                .padding(.bottom, 20)

            VStack(spacing: 20) {
                socialLoginSection
                emailPhoneSection
                dividerSection
                walletSection
            }
            .padding(.bottom, 40)

            footerSection
        }
        .onTapGesture {
            textFieldFocus = false
        }
        .alert("Authentication Error", isPresented: $showErrorAlert) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(errorMessage)
        }
        .sheet(isPresented: $showOTP) {
            if let authState = currentAuthState {
                OTPVerificationView(authState: authState, showOTP: $showOTP)
                    .interactiveDismissDisabled()
            }
        }
        .sheet(isPresented: $showWalletSelection) {
            NavigationStack {
                ExternalWalletAuthView()
            }
        }
    }

    private var socialLoginSection: some View {
        HStack(spacing: 12) {
            ConnectSocialButton(
                provider: .google,
                isLoading: loadingProvider == .google,
                action: handleSocialSignIn,
            )
            ConnectSocialButton(
                provider: .apple,
                isLoading: loadingProvider == .apple,
                action: handleSocialSignIn,
            )
            ConnectSocialButton(
                provider: .discord,
                isLoading: loadingProvider == .discord,
                action: handleSocialSignIn,
            )
        }
        .padding(.horizontal, 24)
    }

    private var emailPhoneSection: some View {
        EmailPhoneInput(
            isFocused: $textFieldFocus,
            onContinue: handleEmailPhone,
        )
        .padding(.horizontal, 24)
    }

    private var dividerSection: some View {
        HStack {
            Rectangle()
                .fill(Color(.systemGray4))
                .frame(height: 1)
            Text("or")
                .font(.footnote)
                .foregroundColor(.secondary)
                .padding(.horizontal, 12)
            Rectangle()
                .fill(Color(.systemGray4))
                .frame(height: 1)
        }
        .padding(.horizontal, 24)
        .padding(.vertical, 8)
    }

    private var walletSection: some View {
        Button(action: {
            showWalletSelection = true
        }) {
            Text("Connect Wallet")
                .font(.callout.weight(.semibold))
                .foregroundColor(.black)
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color(.systemGray5))
                .clipShape(RoundedRectangle(cornerRadius: 12))
        }
        .padding(.horizontal, 24)
    }

    private var footerSection: some View {
        VStack(spacing: 8) {
            HStack(spacing: 4) {
                Text("By logging in you agree to our")
                    .font(.caption)
                    .foregroundColor(.secondary)

                Text("Terms & Conditions")
                    .font(.caption)
                    .foregroundColor(.black)
            }

            HStack(spacing: 4) {
                Text("Powered by")
                    .font(.caption)
                    .foregroundColor(.secondary)

                Image(.paraLogo)
                    .resizable()
                    .frame(width: 12, height: 12)
                    .colorMultiply(.black)

                Text("Para")
                    .font(.caption.bold())
                    .foregroundColor(.black)
            }
        }
        .padding(.bottom, 20)
    }

    // MARK: - Actions

    private func handleSocialSignIn(_ provider: OAuthProvider) {
        Task {
            loadingProvider = provider
            defer { loadingProvider = nil }

            do {
                try await paraManager.handleOAuth(
                    provider: provider,
                    webAuthenticationSession: webAuthenticationSession,
                    authorizationController: authorizationController,
                )
                appRootManager.setAuthenticated(true)
            } catch {
                errorMessage = error.localizedDescription
                showErrorAlert = true
            }
        }
    }

    private func handleEmailPhone(_ auth: Auth) {
        Task {
            do {
                // Start authentication flow with Para SDK
                let state = try await paraManager.initiateAuthFlow(auth: auth)

                print("[EmailAuth] signUpOrLogIn state", state)

                if await handleSloFlowIfNeeded(authState: state) {
                    return
                }

                switch state.stage {
                case .verify:
                    // New user - navigate to verification
                    currentAuthState = state
                    showOTP = true

                case .login:
                    // Existing user - log them in with automatic method selection
                    try await paraManager.handleLogin(
                        authState: state,
                        authorizationController: authorizationController,
                        webAuthenticationSession: webAuthenticationSession,
                    )
                    appRootManager.setAuthenticated(true)

                case .signup:
                    // This shouldn't happen directly
                    errorMessage = "Unexpected authentication state"
                    showErrorAlert = true
                case .done:
                    // Portal-based flow already handled
                    appRootManager.setAuthenticated(true)
                }
            } catch {
                // Handle any errors
                errorMessage = (error as? LocalizedError)?.errorDescription ?? error.localizedDescription
                showErrorAlert = true
            }
        }
    }
}

// MARK: - Preview

#Preview {
    AuthView()
}

// MARK: - Private Helpers

private extension AuthView {
    @MainActor
    func handleSloFlowIfNeeded(authState: AuthState) async -> Bool {
        var sloUrl: String? = authState.loginUrl
        let nextStage = authState.nextStage ?? authState.stage
        let isSloLogin = authState.stage == .login || nextStage == .login

        if sloUrl == nil {
            let methods = (isSloLogin ? authState.loginAuthMethods : authState.signupAuthMethods) ?? []
            if methods.contains("BASIC_LOGIN") {
                do {
                    sloUrl = try await paraManager.getLoginUrl(authMethod: "BASIC_LOGIN")
                    print("[EmailAuth] Generated SLO login URL via getLoginUrl")
                } catch {
                    print("[EmailAuth] Failed to fetch login URL via getLoginUrl", error.localizedDescription)
                }
            }
        }

        guard let loginUrl = sloUrl else {
            return false
        }

        let context = isSloLogin ? "SLO login" : "SLO signup"

        print("[EmailAuth] Stage \(authState.stage.rawValue.uppercased())", [
            "loginUrl": loginUrl,
            "nextStage": nextStage.rawValue,
        ])

        showOTP = false

        do {
            let callbackURL = try await paraManager.presentAuthUrl(
                loginUrl,
                context: context,
                webAuthenticationSession: webAuthenticationSession
            )
            if let callbackURL {
                print("[EmailAuth] \(context) session callback", callbackURL.absoluteString)
            } else {
                print("[EmailAuth] \(context) session completed without callback URL")
            }

            if isSloLogin {
                let loginResult = try await paraManager.waitForLogin()
                print("[EmailAuth] waitForLogin resolved (\(context))", loginResult ?? [:])
            } else {
                let signupResult = try await paraManager.waitForSignup()
                print("[EmailAuth] waitForSignup resolved", signupResult)
            }

            if let session = try await paraManager.touchSession() {
                print("[EmailAuth] Session after \(context)", session)
            }

            appRootManager.setAuthenticated(true)
        } catch {
            errorMessage = error.localizedDescription
            showErrorAlert = true
        }

        return true
    }
}
