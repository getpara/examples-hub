//
//  WalletsView.swift
//  example
//
//  Created by Brian Corbin on 2/6/25.
//

import ParaSwift
import SwiftUI

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
    @State private var isCreatingWallet = false

    private func createWallet(type: WalletType) {
        isCreatingWallet = true

        Task {
            do {
                try await paraManager.createWallet(type: type, skipDistributable: false)

                await MainActor.run {
                    isCreatingWallet = false
                    showSelectCreateWalletTypeView = false
                }
            } catch {
                await MainActor.run {
                    isCreatingWallet = false
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

    @ViewBuilder
    private var createWalletButtonIcon: some View {
        if isCreatingWallet {
            ProgressView()
                .progressViewStyle(.circular)
                .controlSize(.large)
                .tint(.blue)
        } else {
            Image(systemName: "plus.circle.fill")
                .font(.system(size: 60))
                .foregroundColor(.blue)
        }
    }

    @ViewBuilder
    private var createWalletButton: some View {
        Button(action: {
            createWallet(type: selectedWalletType)
        }) {
            VStack(spacing: 16) {
                createWalletButtonIcon
                    .frame(width: 60, height: 60)
                    .animation(.easeInOut(duration: 0.3), value: isCreatingWallet)

                Text(isCreatingWallet ? "Creating..." : "Create Your First \(selectedWalletType.rawValue.uppercased()) Wallet")
                    .font(.title2)
                    .fontWeight(.semibold)
                    .multilineTextAlignment(.center)
                    .animation(.easeInOut(duration: 0.3), value: isCreatingWallet)
            }
            .frame(width: 250, height: 200)
            .padding(40)
            .background(Color.blue.opacity(0.1))
            .cornerRadius(16)
        }
        .buttonStyle(PlainButtonStyle())
        .disabled(isCreatingWallet)
        .padding(.horizontal, 20)
        .accessibilityIdentifier("createFirstWalletButton")
    }

    @ViewBuilder
    private var walletsList: some View {
        List(filteredWallets, id: \.id) { wallet in
            NavigationLink {
                walletDetailView(for: wallet)
            } label: {
                walletLabel(for: wallet)
            }
        }
    }

    @ViewBuilder
    private func walletDetailView(for wallet: Wallet) -> some View {
        switch wallet.type! {
        case .evm:
            EVMWalletView(selectedWallet: wallet)
        case .solana:
            SolanaWalletView(selectedWallet: wallet)
        case .cosmos:
            CosmosWalletView(selectedWallet: wallet)
        }
    }

    @ViewBuilder
    private func walletLabel(for wallet: Wallet) -> some View {
        if wallet.type == .cosmos {
            Text(wallet.addressSecondary ?? "unknown")
                .font(.system(.body, design: .monospaced))
        } else {
            Text(wallet.address ?? "unknown")
                .font(.system(.body, design: .monospaced))
        }
    }

    @ViewBuilder
    private var refreshButton: some View {
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

    private var filteredWallets: [Wallet] {
        paraManager.wallets.filter { $0.type == selectedWalletType }
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

                if filteredWallets.isEmpty {
                    Spacer()
                    createWalletButton
                    Spacer()
                } else {
                    walletsList
                }
            }
            .navigationTitle("Wallets")
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    refreshButton
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Logout") {
                        Task {
                            try! await paraManager.logout()
                            appRootManager.setAuthenticated(false)
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
                Button("OK", role: .cancel) {}
            } message: {
                Text(refreshError?.localizedDescription ?? "An unknown error occurred")
            }
            .alert("Create Wallet Failed", isPresented: $showCreateWalletError) {
                Button("OK", role: .cancel) {}
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
