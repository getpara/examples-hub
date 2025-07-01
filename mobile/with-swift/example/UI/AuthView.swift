//
//  AuthView.swift
//  example
//
//  Created by Tyson Williams on 6/27/25.
//

import Combine
import SwiftUI

struct AuthView: View {
    @State private var emailOrPhone = ""
    @FocusState private var textFieldFocus: Bool
    
    var body: some View {
        VStack(spacing: 0) {
            Spacer()
            
            Image(.paraLogo)
                .resizable()
                .frame(width: 75, height: 75)
            
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
    }
    
    private var socialLoginSection: some View {
        HStack(spacing: 12) {
            ConnectSocialButton(provider: .google, action: handleSocialSignIn)
            ConnectSocialButton(provider: .apple, action: handleSocialSignIn)
            ConnectSocialButton(provider: .discord, action: handleSocialSignIn)
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
        ConnectExternalWalletButton(provider: .metamask, action: handleWalletConnect)
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
        .padding(.bottom, 30)
    }
    
    // MARK: - Actions
    
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
    
    private func handleWalletConnect(_ provider: WalletProvider) {
        // TODO: Implement wallet connection based on provider
        switch provider {
        case .metamask:
            print("MetaMask Connect")
        }
    }
}

// MARK: - Preview

#Preview {
    AuthView()
}
