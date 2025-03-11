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
    
    @State private var selectedWalletType: WalletType = .evm
    @State private var showSelectCreateWalletTypeView = false
    
    private func createWallet(type: WalletType) {
        Task {
            try! await paraManager.createWallet(type: type, skipDistributable: false)
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
                        Task {
                            do {
                                let wallets = try await paraManager.fetchWallets()
                                // Update the published wallets property
                                await MainActor.run {
                                    paraManager.wallets = wallets
                                }
                            } catch {
                                // If needed, you can add error handling or show an alert
                                print("Failed to refresh wallets: \(error)")
                            }
                        }
                    } label: {
                        Image(systemName: "arrow.clockwise")
                    }
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Create") {
                        showSelectCreateWalletTypeView = true
                    }
                }
            }
            .confirmationDialog("Wallet Type", isPresented: $showSelectCreateWalletTypeView) {
                Button("EVM") {
                    createWallet(type: .evm)
                }
                Button("Solana") {
                    createWallet(type: .solana)
                }
                Button("Cosmos") {
                    createWallet(type: .cosmos)
                }
                
                Button("Cancel", role: .cancel) {
                    showSelectCreateWalletTypeView = false
                }
            }
        }
    }
}

#Preview {
    let mockParaManager = ParaManager(environment: .sandbox, apiKey: "preview-key")
    WalletsView()
        .environmentObject(mockParaManager)
}
