//
//  CosmosWalletView.swift
//  example
//
//  Created by Brian Corbin on 2/6/25.
//

import SwiftUI

struct CosmosWalletView: View {
    @EnvironmentObject var paraManager: ParaManager
    @EnvironmentObject var appRootManager: AppRootManager
    
    let selectedWallet: ParaSwift.Wallet
    
    @State private var messageToSign = ""
    @State private var result: (title: String, message: String)?
    @State private var creatingWallet = false
    @State private var isSigning = false
    @State private var isFetching = false
    @State private var isLoading = false
    @State private var balance: String?
    @State private var isFetchingBalance = false
    @State private var cosmosAddress: String?
    
    @State private var paraCosmosSigner: ParaCosmosSigner?
    
    
    private func fetchBalance() {
        guard let signer = paraCosmosSigner else {
            result = ("Error", "Cosmos signer not initialized")
            return
        }
        
        isFetchingBalance = true
        Task {
            do {
                let amount = try await signer.getBalance()
                self.balance = amount
                self.result = ("Success", "Balance fetched successfully")
            } catch {
                self.result = ("Error", "Failed to fetch balance: \(error.localizedDescription)")
            }
            isFetchingBalance = false
        }
    }
    
    private func createAndSignTransaction() {
        guard let signer = paraCosmosSigner else {
            result = ("Error", "Cosmos signer not initialized")
            return
        }
        
        // Create a simple transfer transaction for demo purposes
        // Using a valid Cosmos Hub address as the recipient
        let toAddress = "cosmos1ey69r37gfxvxg62sh4r0ktpuc46pzjrm873ae8"
        
        isLoading = true
        Task {
            do {
                let transaction = try await signer.createTransferTransaction(
                    toAddress: toAddress,
                    amount: "1000000", // 1 ATOM
                    denom: "uatom",
                    memo: "Test transaction from Para Swift SDK"
                )
                
                _ = try await signer.signTransaction(transaction)
                self.result = ("Success", "Transaction signed successfully")
            } catch {
                result = ("Error", "Failed to create transaction: \(error.localizedDescription)")
            }
            isLoading = false
        }
    }
    
    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Wallet Address Card
                VStack(spacing: 12) {
                    Text("Wallet Address")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .frame(maxWidth: .infinity, alignment: .leading)
                    
                    HStack {
                        Text(cosmosAddress ?? "Loading...")
                            .font(.system(.footnote, design: .monospaced))
                            .lineLimit(1)
                            .truncationMode(.middle)
                        
                        Spacer()
                        
                        Button(action: {
                            if let address = cosmosAddress {
                                UIPasteboard.general.string = address
                                result = ("Success", "Address copied to clipboard")
                            } else {
                                result = ("Error", "No address to copy")
                            }
                        }) {
                            Image(systemName: "doc.on.doc")
                                .font(.footnote)
                        }
                        .buttonStyle(.borderless)
                        .accessibilityIdentifier("copyAddressButton")
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(10)
                    
                    if let balanceString = balance {
                        HStack {
                            Text("Balance:")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                            Spacer()
                            Text("\(balanceString) uATOM")
                                .font(.system(.subheadline, design: .monospaced))
                                .foregroundColor(.primary)
                        }
                        .padding(.horizontal)
                        .padding(.top, 8)
                    }
                    
                    Button(action: fetchBalance) {
                        HStack {
                            if isFetchingBalance {
                                ProgressView()
                                    .progressViewStyle(CircularProgressViewStyle())
                                    .scaleEffect(0.8)
                            }
                            Text(isFetchingBalance ? "Fetching..." : "Fetch Balance")
                                .font(.subheadline)
                        }
                    }
                    .disabled(isFetchingBalance)
                    .padding(.horizontal)
                    .padding(.bottom, 8)
                }
                .padding()
                .background(Color(.systemBackground))
                .cornerRadius(16)
                .shadow(color: Color.black.opacity(0.05), radius: 5, x: 0, y: 2)
                
                // Message Signing
                VStack(spacing: 16) {
                    Text("Message Signing")
                        .font(.headline)
                        .frame(maxWidth: .infinity, alignment: .leading)
                    
                    TextField("Enter a message to sign", text: $messageToSign)
                        .autocorrectionDisabled()
                        .padding()
                        .background(Color(.systemGray6))
                        .cornerRadius(10)
                    
                    Button("Sign Message") {
                        guard !messageToSign.isEmpty else {
                            result = ("Error", "Please enter a message to sign.")
                            return
                        }
                        
                        guard let signer = paraCosmosSigner else {
                            result = ("Error", "Cosmos signer not initialized")
                            return
                        }
                        
                        isSigning = true
                        Task {
                            do {
                                _ = try await signer.signMessage(messageToSign)
                                result = ("Success", "Message signed successfully")
                            } catch {
                                result = ("Error", "Failed to sign message: \(error.localizedDescription)")
                            }
                            isSigning = false
                        }
                    }
                    .buttonStyle(.borderedProminent)
                    .disabled(isSigning || messageToSign.isEmpty)
                    .frame(maxWidth: .infinity)
                    .overlay {
                        if isSigning {
                            ProgressView()
                                .tint(.white)
                        }
                    }
                }
                .padding()
                .background(Color(.systemBackground))
                .cornerRadius(16)
                .shadow(color: Color.black.opacity(0.05), radius: 5, x: 0, y: 2)
                
                // Transaction Operations
                VStack(spacing: 16) {
                    Text("Transaction Operations")
                        .font(.headline)
                        .frame(maxWidth: .infinity, alignment: .leading)
                    
                    Button("Sign Transaction") {
                        createAndSignTransaction()
                    }
                    .buttonStyle(.bordered)
                    .frame(maxWidth: .infinity)
                    .disabled(isLoading)
                }
                .padding()
                .background(Color(.systemBackground))
                .cornerRadius(16)
                .shadow(color: Color.black.opacity(0.05), radius: 5, x: 0, y: 2)
                
                // Wallet Management
                VStack(spacing: 16) {
                    Text("Wallet Management")
                        .font(.headline)
                        .frame(maxWidth: .infinity, alignment: .leading)
                    
                    HStack(spacing: 16) {
                        Button("Check Session") {
                            isFetching = true
                            Task {
                                do {
                                    let active = try await paraManager.isSessionActive()
                                    result = ("Session Status", "Session Active: \(active)")
                                    isFetching = false
                                } catch {
                                    isFetching = false
                                    result = ("Error", "Failed to check session: \(error.localizedDescription)")
                                }
                            }
                        }
                        .buttonStyle(.bordered)
                        .frame(maxWidth: .infinity)
                        
                        Button("Fetch Wallets") {
                            isFetching = true
                            Task {
                                do {
                                    let wallets = try await paraManager.fetchWallets()
                                    let addresses = wallets.map { $0.address ?? "No Address" }
                                    result = ("Wallets", addresses.joined(separator: "\n"))
                                    isFetching = false
                                } catch {
                                    isFetching = false
                                    result = ("Error", "Failed to fetch wallets: \(error.localizedDescription)")
                                }
                            }
                        }
                        .buttonStyle(.bordered)
                        .frame(maxWidth: .infinity)
                    }
                    .disabled(isFetching)
                    .overlay {
                        if isFetching {
                            ProgressView()
                        }
                    }
                }
                .padding()
                .background(Color(.systemBackground))
                .cornerRadius(16)
                .shadow(color: Color.black.opacity(0.05), radius: 5, x: 0, y: 2)
                
                // Logout
                Button("Logout") {
                    Task {
                        isLoading = true
                        do {
                            try await paraManager.logout()
                            appRootManager.currentRoot = .authentication
                        } catch {
                            result = ("Error", "Failed to logout: \(error.localizedDescription)")
                        }
                        isLoading = false
                    }
                }
                .buttonStyle(.bordered)
                .tint(.red)
                .disabled(isLoading)
                .padding(.top, 12)
            }
            .padding()
        }
        .navigationTitle("Cosmos Wallet")
        .alert(item: Binding(
            get: { result.map { AlertItem(title: $0.title, message: $0.message) } },
            set: { _ in result = nil }
        )) { alert in
            Alert(
                title: Text(alert.title),
                message: Text(alert.message),
                dismissButton: .default(Text("OK"))
            )
        }
        .onAppear {
            Task {
                isLoading = true
                do {
                    // Initialize Para Cosmos signer with bridge pattern
                    let signer = try ParaCosmosSigner(
                        paraManager: paraManager,
                        chain: .cosmos // Just use Cosmos Hub by default
                    )
                    
                    // Explicitly select the wallet to ensure it's properly initialized
                    try await signer.selectWallet(walletId: selectedWallet.id)
                    
                    await MainActor.run {
                        self.paraCosmosSigner = signer
                    }
                    
                    // Use the address from the wallet
                    await MainActor.run {
                        self.cosmosAddress = selectedWallet.addressSecondary ?? selectedWallet.address
                    }
                } catch {
                    result = ("Error", "Failed to initialize Cosmos signer: \(error.localizedDescription)")
                }
                isLoading = false
            }
        }
        .overlay {
            if isLoading {
                ZStack {
                    Color.black.opacity(0.2)
                    ProgressView()
                        .scaleEffect(1.5)
                }
                .ignoresSafeArea()
            }
        }
    }
}

#Preview {
    CosmosWalletView()
}
