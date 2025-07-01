//
//  ConnectExternalWalletButton.swift
//  example
//
//  Created by Tyson Williams on 7/1/25.
//

import SwiftUI

enum WalletProvider {
    case metamask
}

struct ConnectExternalWalletButton: View {
    let provider: WalletProvider
    let action: (WalletProvider) -> Void
    @State private var isConnecting = false
    @State private var error: Error?
    @State private var showError = false

    private var walletImage: ImageResource {
        switch provider {
        case .metamask:
            .metamask
        }
    }

    private var walletName: String {
        switch provider {
        case .metamask:
            "MetaMask"
        }
    }

    var body: some View {
        Button(action: {
            if !isConnecting {
                action(provider)
            }
        }) {
            HStack(spacing: 12) {
                if isConnecting {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                        .scaleEffect(0.8)
                } else {
                    Image(walletImage)
                        .resizable()
                        .frame(width: 24, height: 24)
                }

                Text(isConnecting ? "Connecting..." : "Connect \(walletName)")
                    .font(.callout.weight(.semibold))
                    .foregroundColor(.white)
            }
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

// MARK: - Preview

#Preview("Wallet Buttons") {
    VStack(spacing: 16) {
        Text("Normal State")
            .font(.headline)

        ConnectExternalWalletButton(provider: .metamask) { provider in
            print("Tapped \(provider)")
        }
        .padding(.horizontal)

        Text("Connecting State")
            .font(.headline)
            .padding(.top)

        ConnectExternalWalletButton(provider: .metamask) { _ in }
            .onAppear {
                // This will show the connecting state in preview
            }
            .padding(.horizontal)

        Text("Different Sizes")
            .font(.headline)
            .padding(.top)

        VStack(spacing: 8) {
            ConnectExternalWalletButton(provider: .metamask) { _ in }
                .frame(width: 200)

            ConnectExternalWalletButton(provider: .metamask) { _ in }
                .frame(width: 300)
        }
    }
    .padding()
}
