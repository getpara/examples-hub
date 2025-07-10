//
//  WalletsView.swift
//  example
//
//  Created by Brian Corbin on 2/6/25.
//

import ParaSwift
import SwiftUI

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }

        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255,
        )
    }
}

struct WalletsView: View {
    @EnvironmentObject var paraManager: ParaManager
    @EnvironmentObject var appRootManager: AppRootManager

    @State private var showCreateWalletSheet = false
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
                    showCreateWalletSheet = false
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
            showCreateWalletSheet = true
        }) {
            VStack(spacing: 16) {
                createWalletButtonIcon
                    .frame(width: 60, height: 60)
                    .animation(.easeInOut(duration: 0.3), value: isCreatingWallet)

                Text("Create Your First Wallet")
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
        .padding(.horizontal, 20)
        .accessibilityIdentifier("createFirstWalletButton")
    }

    private func chainColor(for type: WalletType) -> Color {
        switch type {
        case .evm:
            Color(hex: "627EEA") // Ethereum Blue
        case .solana:
            Color(hex: "9945FF") // Solana Purple
        case .cosmos:
            Color(hex: "502D82") // Cosmic Purple
        }
    }

    private func chainGradient(for type: WalletType) -> LinearGradient {
        switch type {
        case .evm:
            // Pure blue gradient - horizontal
            LinearGradient(
                colors: [Color(hex: "627EEA"), Color(hex: "3B5998")],
                startPoint: .leading,
                endPoint: .trailing,
            )
        case .solana:
            // Signature purple to green - diagonal
            LinearGradient(
                colors: [Color(hex: "9945FF"), Color(hex: "14F195")],
                startPoint: .topLeading,
                endPoint: .bottomTrailing,
            )
        case .cosmos:
            // Deep space purple to pink - vertical
            LinearGradient(
                colors: [Color(hex: "2E1A47"), Color(hex: "B249C8")],
                startPoint: .top,
                endPoint: .bottom,
            )
        }
    }

    @ViewBuilder
    private func walletCard(for wallet: Wallet) -> some View {
        NavigationLink {
            walletDetailView(for: wallet)
        } label: {
            RoundedRectangle(cornerRadius: 16)
                .fill(chainGradient(for: wallet.type ?? .evm))
                .overlay(
                    VStack(alignment: .leading, spacing: 8) {
                        let address = wallet.type == .cosmos ? (wallet.addressSecondary ?? "unknown") : (wallet.address ?? "unknown")
                        let displayAddress = formatAddress(address)

                        Text(displayAddress)
                            .font(.system(.title3, design: .monospaced))
                            .fontWeight(.semibold)
                            .foregroundStyle(.white)
                            .lineLimit(1)
                            .minimumScaleFactor(0.7)

                        Text(wallet.type?.rawValue ?? "unknown")
                            .font(.subheadline)
                            .fontWeight(.medium)
                            .foregroundStyle(.white.opacity(0.9))
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.horizontal, 20)
                    .padding(.vertical, 16),
                )
                .frame(height: 150)
                .shadow(color: chainColor(for: wallet.type ?? .evm).opacity(0.3), radius: 8, x: 0, y: 4)
        }
        .buttonStyle(PlainButtonStyle())
    }

    private func formatAddress(_ address: String) -> String {
        guard address.count > 12 else { return address }
        let prefix = address.prefix(8)
        let suffix = address.suffix(6)
        return "\(prefix)...\(suffix)"
    }

    @ViewBuilder
    private var addWalletCard: some View {
        Button(action: {
            showCreateWalletSheet = true
        }) {
            RoundedRectangle(cornerRadius: 12)
                .strokeBorder(style: StrokeStyle(lineWidth: 1, dash: [5]))
                .foregroundStyle(Color.gray.opacity(0.3))
                .overlay(
                    HStack(spacing: 8) {
                        Image(systemName: "plus.circle")
                            .font(.body)
                            .foregroundStyle(.secondary)

                        Text("Add Wallet")
                            .font(.body)
                            .foregroundStyle(.secondary)
                    },
                )
                .frame(height: 150)
        }
        .buttonStyle(PlainButtonStyle())
        .accessibilityIdentifier("addWalletButton")
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

    var body: some View {
        NavigationStack {
            ScrollView {
                LazyVStack(spacing: 12) {
                    ForEach(paraManager.wallets, id: \.id) { wallet in
                        walletCard(for: wallet)
                    }

                    if paraManager.wallets.isEmpty {
                        VStack(spacing: 20) {
                            Spacer()
                            createWalletButton
                            Spacer()
                        }
                        .frame(maxWidth: .infinity, minHeight: 400)
                    } else {
                        addWalletCard
                    }
                }
                .padding(.horizontal)
            }
            .navigationTitle("Wallets")
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    refreshButton
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Logout") {
                        Task {
                            do {
                                await MainActor.run {
                                    appRootManager.setAuthenticated(false)
                                }
                                try await paraManager.logout()
                            } catch {
                                // Handle logout error - could show an alert or log the error
                                print("Logout failed: \(error.localizedDescription)")
                            }
                        }
                    }
                    .accessibilityIdentifier("logoutButton")
                }
            }
            .sheet(isPresented: $showCreateWalletSheet) {
                VStack(spacing: 16) {
                    Text("Select Wallet Type")
                        .font(.headline)
                        .padding(.top, 24)

                    VStack(spacing: 8) {
                        ForEach([WalletType.evm, .solana, .cosmos], id: \.self) { type in
                            Button(action: {
                                createWallet(type: type)
                            }) {
                                Text(type.rawValue)
                                    .font(.body)
                                    .fontWeight(.medium)
                                    .foregroundStyle(.white)
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 16)
                                    .background(chainGradient(for: type))
                                    .cornerRadius(10)
                            }
                            .buttonStyle(PlainButtonStyle())
                            .accessibilityIdentifier("\(type.rawValue.lowercased())WalletButton")
                        }
                    }
                    .padding(.horizontal)
                    .padding(.bottom, 16)
                }
                .presentationDetents([.height(240)])
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

#Preview("Empty State") {
    let mockParaManager = ParaManager(environment: .sandbox, apiKey: "preview-key")
    WalletsView()
        .environmentObject(mockParaManager)
        .environmentObject(AppRootManager())
}

#Preview("With Wallets") {
    let mockParaManager = ParaManager(environment: .sandbox, apiKey: "preview-key")

    // Create mock wallets
    mockParaManager.wallets = [
        Wallet(
            id: "1",
            signer: "signer1",
            address: "0x742d35Cc6634C0532925a3b844Bc9e7595f8b2dc",
            publicKey: "publicKey1",
        ),
        Wallet(
            id: "2",
            signer: "signer2",
            address: "7EYnhQoR9YM3N7UoaKRoA44Uy8JeaZV3qyouov87awMs",
            publicKey: "publicKey2",
        ),
        Wallet(
            id: "3",
            signer: "signer3",
            address: "cosmos1234567890abcdefghijklmnopqrstuvwxyz",
            publicKey: "publicKey3",
        ),
    ]

    // Manually set wallet types since the init doesn't include them
    var evmWallet = mockParaManager.wallets[0]
    evmWallet = Wallet(result: [
        "id": "1",
        "type": "EVM",
        "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f8b2dc",
        "signer": "signer1",
        "publicKey": "publicKey1",
    ])

    var solanaWallet = mockParaManager.wallets[1]
    solanaWallet = Wallet(result: [
        "id": "2",
        "type": "SOLANA",
        "address": "7EYnhQoR9YM3N7UoaKRoA44Uy8JeaZV3qyouov87awMs",
        "signer": "signer2",
        "publicKey": "publicKey2",
    ])

    var cosmosWallet = mockParaManager.wallets[2]
    cosmosWallet = Wallet(result: [
        "id": "3",
        "type": "COSMOS",
        "address": "cosmos1234567890abcdefghijklmnopqrstuvwxyz",
        "addressSecondary": "cosmos1vx8knpllrj7n963p9ttd80w47kpacrhuts497x",
        "signer": "signer3",
        "publicKey": "publicKey3",
    ])

    mockParaManager.wallets = [evmWallet, solanaWallet, cosmosWallet]

    return WalletsView()
        .environmentObject(mockParaManager)
        .environmentObject(AppRootManager())
}
