//
//  ExternalWalletAuthView.swift
//  ParaSample
//
//  Created by Tyson Williams on 2/7/25.
//

import SwiftUI
import ParaSwift

struct ExternalWalletAuthView: View {
    @EnvironmentObject private var paraManager: ParaManager
    @EnvironmentObject private var appRootManager: AppRootManager
    @EnvironmentObject private var metaMaskConnector: MetaMaskConnector
    
    @Environment(\.authorizationController) private var authorizationController
    
    @State private var isConnecting = false
    @State private var error: Error?
    @State private var showError = false
    @State private var showMetaMask = false
    
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
            Button("OK", role: .cancel) { }
        } message: {
            Text(error?.localizedDescription ?? "Unknown error occurred")
        }
        .navigationDestination(isPresented: $showMetaMask) {
            MetaMaskDemoView()
        }
        .navigationTitle("External Wallet")
    }
    
    private func connectMetaMask() {
        isConnecting = true
        
        Task {
            do {
                let connectResponse = try await metaMaskConnector.connect()
                if !connectResponse.userExists || !connectResponse.isVerified || !connectResponse.hasBiometrics {
                    let signedMessage = try await metaMaskConnector.signMessage(connectResponse.signatureVerificationMessage, account: metaMaskConnector.accounts.first!)
                    let biometricsId = try await paraManager.verifyExternalWallet(address: metaMaskConnector.accounts.first!, signedMessage: signedMessage)
                    try await paraManager.generatePasskey(identifier: metaMaskConnector.accounts.first!, biometricsId: biometricsId, authorizationController: authorizationController)
                } else {
                    try await paraManager.login(authorizationController: authorizationController, authInfo: metaMaskConnector.authInfo)
                    print("Logged In")
                }
                
                showMetaMask = true
            } catch {
                self.error = error
                self.showError = true
            }
            isConnecting = false
        }
    }
}

#Preview {
    ExternalWalletAuthView()
        .environmentObject(ParaManager(environment: .sandbox, apiKey: "preview-key"))
        .environmentObject(AppRootManager())
        .environmentObject(MetaMaskConnector(
            para: ParaManager(environment: .sandbox, apiKey: "preview-key"),
            appUrl: "https://example.com",
            config: MetaMaskConfig(appName: "Example App", appId: "example-app")
        ))
}
