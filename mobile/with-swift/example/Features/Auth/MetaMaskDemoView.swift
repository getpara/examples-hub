//
//  MetaMaskDemoView.swift
//  example
//
//  Created by Tyson Williams on 2/10/25.
//

import SwiftUI
import ParaSwift
import Web3Core

struct MetaMaskDemoView: View {
    @EnvironmentObject private var metaMaskConnector: MetaMaskConnector
    @State private var isLoading = false
    @State private var alert: (title: String, message: String)?
    
    var body: some View {
        VStack(spacing: 24) {
            if let account = metaMaskConnector.accounts.first {
                Text(account)
                    .font(.system(.callout, design: .monospaced))
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(8)
            }
            
            Button("Sign Message") {
                Task { await signMessage() }
            }
            .buttonStyle(.borderedProminent)
            .controlSize(.large)
            .tint(.orange)
            
            Button("Send Transaction") {
                Task { await sendTransaction() }
            }
            .buttonStyle(.borderedProminent)
            .controlSize(.large)
            .tint(.orange)
        }
        .padding()
        .navigationTitle("MetaMask Wallet")
        .disabled(isLoading)
        .alert(alert?.title ?? "", isPresented: Binding(
            get: { alert != nil },
            set: { if !$0 { alert = nil } }
        )) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(alert?.message ?? "")
        }
    }
    
    private func signMessage() async {
        guard let account = metaMaskConnector.accounts.first else { return }
        isLoading = true
        defer { isLoading = false }
        
        do {
            let signature = try await metaMaskConnector.signMessage("Message to sign! Hello World", account: account)
            alert = ("Success", "Message signed: \(signature)")
        } catch {
            alert = ("Error", error.localizedDescription)
        }
    }
    
    private func sendTransaction() async {
        guard let account = metaMaskConnector.accounts.first else { return }
        isLoading = true
        defer { isLoading = false }
        
        do {
            let valueInWei = Web3Core.Utilities.parseToBigUInt("0.001", units: .ether)!
            let gasLimit = Web3Core.Utilities.parseToBigUInt("100000", units: .wei)!
            
            // Create an EVMTransaction using the convenience initializer
            let transaction = EVMTransaction(
                to: "0x13158486860B81Dee9e43Dd0391e61c2F82B577F",
                value: valueInWei,
                gasLimit: gasLimit
            )
            
            let txHash = try await metaMaskConnector.sendTransaction(transaction, account: account)
            alert = ("Success", "Transaction sent: \(txHash)")
        } catch {
            alert = ("Error", error.localizedDescription)
        }
    }
}

#Preview {
    NavigationView {
        MetaMaskDemoView()
            .environmentObject(MetaMaskConnector(
                para: ParaManager(environment: .sandbox, apiKey: "preview-key"),
                appUrl: "https://example.com",
                config: MetaMaskConfig(appName: "Example App", appId: "example-app")
            ))
    }
}
