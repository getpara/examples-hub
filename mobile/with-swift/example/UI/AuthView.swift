//
//  AuthView.swift
//  example
//
//  Created by Tyson Williams on 6/27/25.
//

import SwiftUI

struct AuthView: View {
    // MARK: - State Properties

    @State private var emailOrPhone = ""
    @FocusState private var textFieldFocus: Bool

    // MARK: - Colors

    private let paraOrange = Color(red: 235 / 255, green: 87 / 255, blue: 43 / 255)
    private let lightGray = Color(red: 245 / 255, green: 245 / 255, blue: 245 / 255)

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
                    metaMaskSection
                }

                Spacer()
                    .frame(height: 40)

                footerSection
            }
        }
        .background(Color(.systemBackground))
    }

    // MARK: - View Components

    private var headerSection: some View {
        VStack(spacing: 20) {
            Image(systemName: "star.fill")
                .font(.system(size: 50))
                .foregroundColor(.black)

            Text("Sign Up or Log In")
                .font(.title2)
                .fontWeight(.semibold)
                .foregroundColor(.black)
        }
    }

    private var socialLoginSection: some View {
        HStack(spacing: 12) {
            SocialButton(image: .google, action: handleGoogleSignIn)
            SocialButton(image: .apple, action: handleAppleSignIn)
            SocialButton(image: .discord, action: handleDiscordSignIn)
        }
        .padding(.horizontal, 24)
    }

    private var emailPhoneSection: some View {
        VStack(spacing: 12) {
            HStack(spacing: 8) {
                Image(systemName: "envelope")
                    .foregroundColor(.gray)
                Image(systemName: "phone")
                    .foregroundColor(.gray)

                TextField("Enter email or phone", text: $emailOrPhone)
                    .focused($textFieldFocus)
                    .keyboardType(isPhoneNumber(emailOrPhone) ? .phonePad : .emailAddress)
                    .textContentType(isPhoneNumber(emailOrPhone) ? .telephoneNumber : .emailAddress)
                    .autocapitalization(.none)
            }
            .padding()
            .background(Color(.systemGray6))
            .clipShape(RoundedRectangle(cornerRadius: 8))
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(textFieldFocus ? paraOrange : Color.clear, lineWidth: 2)
            )

            if textFieldFocus, !emailOrPhone.isEmpty {
                Button("Continue", action: handleContinue)
                    .font(.callout.weight(.medium))
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .frame(height: 50)
                    .background(paraOrange)
                    .clipShape(Capsule())
                    .transition(.move(edge: .bottom).combined(with: .opacity))
            }
        }
        .padding(.horizontal, 24)
        .animation(.easeInOut(duration: 0.2), value: textFieldFocus)
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

    private var metaMaskSection: some View {
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

    // MARK: - Helper Methods

    private func isPhoneNumber(_ text: String) -> Bool {
        let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
        let phonePattern = "^[+]?[0-9]"
        return trimmed.range(of: phonePattern, options: .regularExpression) != nil && !trimmed.contains("@")
    }

    // MARK: - Actions

    private func handleGoogleSignIn() {
        // TODO: Implement Google Sign In
    }

    private func handleAppleSignIn() {
        // TODO: Implement Apple Sign In
    }

    private func handleDiscordSignIn() {
        // TODO: Implement Discord Sign In
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
    let image: ImageResource
    let action: () -> Void

    private let lightGray = Color(red: 245 / 255, green: 245 / 255, blue: 245 / 255)

    var body: some View {
        Button(action: action) {
            Image(image)
                .resizable()
                .aspectRatio(contentMode: .fit)
                .frame(height: 24)
                .frame(maxWidth: .infinity)
                .frame(height: 64)
                .background(lightGray)
                .clipShape(RoundedRectangle(cornerRadius: 12))
        }
    }
}


// MARK: - Preview

#Preview {
    AuthView()
}