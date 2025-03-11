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
                try await metaMaskConnector.connect()
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
