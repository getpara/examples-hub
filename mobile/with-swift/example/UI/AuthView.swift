//
//  AuthView.swift
//  example
//
//  Created by Tyson Williams on 6/27/25.
//

import Combine
import SwiftUI

struct AuthView: View {
    // MARK: - State Properties

    @State private var emailOrPhone = ""
    @FocusState private var textFieldFocus: Bool


    // MARK: - Body

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                Spacer()
                    .frame(height: 80)

                headerSection

                Spacer()
                    .frame(height: 40)

                VStack(spacing: 20) {
                    socialLoginSection
                    emailPhoneSection
                    dividerSection
                    walletSection
                }

                Spacer()
                    .frame(height: 40)

                footerSection
            }
        }
        .onTapGesture {
            textFieldFocus = false
        }
    }

    // MARK: - View Components

    private var headerSection: some View {
        VStack(spacing: 20) {
            Image(.paraLogo)
                .resizable()
                .frame(width: 75, height: 75)

            Text("Sign Up or Log In")
                .font(.title2)
                .fontWeight(.semibold)
                .foregroundColor(.black)
        }
    }

    private var socialLoginSection: some View {
        HStack(spacing: 12) {
            SocialButton(provider: .google, action: handleSocialSignIn)
            SocialButton(provider: .apple, action: handleSocialSignIn)
            SocialButton(provider: .discord, action: handleSocialSignIn)
        }
        .padding(.horizontal, 24)
    }

    private var emailPhoneSection: some View {
        EmailPhoneInput(
            text: $emailOrPhone,
            isFocused: $textFieldFocus,
            onContinue: handleContinue,
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
        MetaMaskConnectButton(action: handleMetaMaskConnect)
            .padding(.horizontal, 24)
    }

    private var footerSection: some View {
        VStack(spacing: 8) {
            Text("By logging in you agree to our Terms & Conditions")
                .font(.caption)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)

            HStack(spacing: 4) {
                Text("Powered by")
                    .font(.caption)
                    .foregroundColor(.secondary)
                Text("Para")
                    .font(.caption.bold())
                    .foregroundColor(.black)
            }
        }
        .padding(.bottom, 30)
    }

    // MARK: - Actions

    enum SocialProvider {
        case google
        case apple
        case discord
    }

    private func handleSocialSignIn(_ provider: SocialProvider) {
        // TODO: Implement social sign in based on provider
        switch provider {
        case .google:
            print("Google Sign In")
        case .apple:
            print("Apple Sign In")
        case .discord:
            print("Discord Sign In")
        }
    }

    private func handleContinue() {
        // TODO: Handle email/phone sign in
    }

    private func handleMetaMaskConnect() {
        // TODO: Connect MetaMask wallet
    }
}

// MARK: - Subviews

struct MetaMaskConnectButton: View {
    let action: () -> Void
    @State private var isConnecting = false
    @State private var error: Error?
    @State private var showError = false

    var body: some View {
        Button(action: {
            if !isConnecting {
                action()
            }
        }) {
            HStack(spacing: 12) {
                if isConnecting {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                        .scaleEffect(0.8)
                } else {
                    Image(.metamask)
                        .resizable()
                        .frame(width: 24, height: 24)
                }

                Text(isConnecting ? "Connecting..." : "Connect MetaMask")
                    .font(.callout.weight(.semibold))
                    .foregroundColor(.white)
            }
            .frame(maxWidth: .infinity)
            .frame(maxWidth: .infinity)
            .padding()
            .background(Color.orange)
            .clipShape(RoundedRectangle(cornerRadius: 12))
        }
        .disabled(isConnecting)
        .alert("Connection Error", isPresented: $showError) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(error?.localizedDescription ?? "Unknown error occurred")
        }
    }

    func setConnecting(_ connecting: Bool) {
        isConnecting = connecting
    }

    func setError(_ error: Error?) {
        self.error = error
        showError = error != nil
    }
}

struct SocialButton: View {
    let provider: AuthView.SocialProvider
    let action: (AuthView.SocialProvider) -> Void


    private var image: ImageResource {
        switch provider {
        case .google:
            .google
        case .apple:
            .apple
        case .discord:
            .discord
        }
    }

    var body: some View {
        Button(action: { action(provider) }) {
            Image(image)
                .resizable()
                .aspectRatio(contentMode: .fit)
                .frame(height: 24)
                .frame(maxWidth: .infinity)
                .frame(height: 64)
                .background(.lightGray)
                .clipShape(RoundedRectangle(cornerRadius: 12))
        }
    }
}

// MARK: - Preview

#Preview {
    AuthView()
}
