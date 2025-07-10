//
//  ExternalWalletAuthView.swift
//  ParaSample
//
//  Created by Tyson Williams on 2/7/25.
//

import ParaSwift
import SwiftUI

struct ExternalWalletAuthView: View {
    @EnvironmentObject private var paraManager: ParaManager
    @EnvironmentObject private var appRootManager: AppRootManager
    @Environment(\.dismiss) private var dismiss

    @State private var isConnecting = false
    @State private var error: Error?
    @State private var showError = false
    @State private var showMetaMask = false
    @State private var metaMaskConnector: MetaMaskConnector?

    var body: some View {
        VStack(spacing: 20) {
            Button(action: connectMetaMask) {
                HStack {
                    Image(.metamask)
                        .resizable()
                        .frame(width: 40, height: 40)

                    Text("Connect MetaMask")
                        .fontWeight(.semibold)
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.orange)
                .foregroundColor(.white)
                .cornerRadius(12)
            }
            .disabled(isConnecting)

            Spacer()

            if isConnecting {
                ProgressView()
                    .progressViewStyle(CircularProgressViewStyle())
            }
        }
        .padding()
        .alert("Connection Error", isPresented: $showError) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(error?.localizedDescription ?? "Unknown error occurred")
        }
        .navigationDestination(isPresented: $showMetaMask) {
            if let connector = metaMaskConnector {
                MetaMaskDemoView()
                    .environmentObject(connector)
            }
        }
        .navigationTitle("External Wallet")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarLeading) {
                Button("Cancel") {
                    dismiss()
                }
            }
        }
    }

    private func connectMetaMask() {
        isConnecting = true

        Task {
            do {
                // Initialize MetaMask connector if needed
                if metaMaskConnector == nil {
                    let bundleId = Bundle.main.bundleIdentifier ?? ""
                    let config = MetaMaskConfig(
                        appName: "ExampleApp",
                        appId: bundleId,
                        apiVersion: "1.0",
                    )
                    metaMaskConnector = MetaMaskConnector(
                        para: paraManager,
                        appUrl: "https://\(bundleId)",
                        config: config,
                    )
                }

                try await metaMaskConnector?.connect()
                showMetaMask = true
            } catch {
                self.error = error
                showError = true
            }
            isConnecting = false
        }
    }
}

#Preview {
    NavigationStack {
        ExternalWalletAuthView()
            .environmentObject(ParaManager(environment: .sandbox, apiKey: "preview-key"))
            .environmentObject(AppRootManager())
    }
}
