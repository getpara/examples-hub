//
//  WalletsView.swift
//  example
//
//  Created by Brian Corbin on 2/6/25.
//

import SwiftUI
import ParaSwift

struct WalletsView: View {
    @EnvironmentObject var paraManager: ParaManager
    @EnvironmentObject var appRootManager: AppRootManager
    
    @State private var selectedWalletType: WalletType = .evm
    @State private var showSelectCreateWalletTypeView = false
    @State private var isRefreshing = false
    @State private var refreshError: Error?
    @State private var showRefreshError = false
    @State private var createWalletError: Error?
    @State private var showCreateWalletError = false
    
    private func createWallet(type: WalletType) {
        Task {
            do {
                try await paraManager.createWallet(type: type, skipDistributable: false)
                
                await MainActor.run {
                    showSelectCreateWalletTypeView = false
                }
            } catch {
                await MainActor.run {
                    createWalletError = error
                    showCreateWalletError = true
                }
            }
        }
    }
    
    private func refreshWallets() {
        guard !isRefreshing else { return }
        isRefreshing = true
        refreshError = nil
        
        Task {
            do {
                let wallets = try await paraManager.fetchWallets()
                // Update the published wallets property
                await MainActor.run {
                    paraManager.wallets = wallets
                    isRefreshing = false
                }
            } catch {
                await MainActor.run {
                    refreshError = error
                    showRefreshError = true
                    isRefreshing = false
                }
            }
        }
    }
    
    var body: some View {
        NavigationStack {
            VStack {
                Picker("Select Wallet Type", selection: $selectedWalletType) {
                    Text("EVM").tag(WalletType.evm)
                    Text("Solana").tag(WalletType.solana)
                    Text("Cosmos").tag(WalletType.cosmos)
                }
                .pickerStyle(.segmented)
                .padding(.horizontal)
                List(paraManager.wallets.filter({ $0.type == selectedWalletType }), id: \.id) { wallet in
                    NavigationLink {
                        switch wallet.type! {
                        case .evm:
                            EVMWalletView(selectedWallet: wallet)
                        case .solana:
                            SolanaWalletView()
                        case .cosmos:
                            CosmosWalletView()
                        }
                    } label: {
                        Text(wallet.address ?? "unknown")
                    }
                }
            }
            .navigationTitle("Wallets")
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button {
                        refreshWallets()
                    } label: {
                        if isRefreshing {
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle())
                        } else {
                            Image(systemName: "arrow.clockwise")
                        }
                    }
                    .disabled(isRefreshing)
                    .accessibilityIdentifier("refreshButton")
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Create") {
                        showSelectCreateWalletTypeView = true
                    }
                    .accessibilityIdentifier("createWalletButton")
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Logout") {
                        Task {
                            try! await paraManager.logout()
                            appRootManager.currentRoot = .authentication
                        }
                    }
                    .accessibilityIdentifier("logoutButton")
                }
            }
            .confirmationDialog("Wallet Type", isPresented: $showSelectCreateWalletTypeView) {
                Button("EVM") {
                    createWallet(type: .evm)
                }
                .accessibilityIdentifier("evmWalletButton")
                Button("Solana") {
                    createWallet(type: .solana)
                }
                .accessibilityIdentifier("solanaWalletButton")
                Button("Cosmos") {
                    createWallet(type: .cosmos)
                }
                .accessibilityIdentifier("cosmosWalletButton")
                
                Button("Cancel", role: .cancel) {
                    showSelectCreateWalletTypeView = false
                }
                .accessibilityIdentifier("cancelWalletButton")
            }
            .alert("Refresh Failed", isPresented: $showRefreshError) {
                Button("OK", role: .cancel) { }
            } message: {
                Text(refreshError?.localizedDescription ?? "An unknown error occurred")
            }
            .alert("Create Wallet Failed", isPresented: $showCreateWalletError) {
                Button("OK", role: .cancel) { }
            } message: {
                Text(createWalletError?.localizedDescription ?? "An unknown error occurred")
            }
        }
        .accessibilityIdentifier("walletsView")
    }
}

#Preview {
    let mockParaManager = ParaManager(environment: .sandbox, apiKey: "preview-key")
    WalletsView()
        .environmentObject(mockParaManager)
        .environmentObject(AppRootManager())
}
