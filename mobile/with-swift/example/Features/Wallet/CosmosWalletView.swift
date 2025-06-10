//
//  CosmosWalletView.swift
//  example
//
//  Created by Brian Corbin on 2/6/25.
//

import ParaSwift
import SwiftUI

struct CosmosWalletView: View {
    @EnvironmentObject var paraManager: ParaManager
    @EnvironmentObject var appRootManager: AppRootManager

    let selectedWallet: ParaSwift.Wallet

    @State private var messageToSign = ""
    @State private var result: (title: String, message: String)?
    @State private var isSigning = false
    @State private var isFetching = false
    @State private var isLoading = false
    @State private var balance: String?
    @State private var isFetchingBalance = false
    @State private var cosmosAddress: String?
    @State private var selectedSigningMethod: CosmosSigningMethod = .proto // Default to Proto

    // Chain configuration states
    @State private var selectedChain = "cosmoshub-4"
    @State private var customChainId = ""
    @State private var customPrefix = ""
    @State private var customRpcUrl = ""
    @State private var useCustomConfig = false

    @State private var paraCosmosSigner: ParaCosmosSigner?

    // Common Cosmos chains
    private let commonChains = [
        ("Cosmos Hub", "cosmoshub-4", "cosmos", "https://cosmos-rpc.polkachu.com"),
        ("Osmosis", "osmosis-1", "osmo", "https://osmosis-rpc.polkachu.com"),
        ("Juno", "juno-1", "juno", "https://juno-rpc.polkachu.com"),
        ("Stargaze", "stargaze-1", "stars", "https://stargaze-rpc.polkachu.com"),
    ]

    private func fetchBalance() {
        guard let signer = paraCosmosSigner else {
            result = ("Error", "Cosmos signer not initialized")
            return
        }

        isFetchingBalance = true
        Task {
            do {
                let amount = try await signer.getBalance()
                balance = amount
                result = ("Success", "Balance fetched successfully")
            } catch {
                result = ("Error", "Failed to fetch balance: \(error.localizedDescription)")
            }
            isFetchingBalance = false
        }
    }

    private func createAndSignTransaction() {
        guard let signer = paraCosmosSigner else {
            result = ("Error", "Cosmos signer not initialized")
            return
        }

        let (_, prefix, _) = getChainConfig()
        let denom = getDenomForChain()

        // Use a test address with the correct prefix
        let toAddress = "\(prefix)1ey69r37gfxvxg62sh4r0ktpuc46pzjrm873ae8"

        isLoading = true
        Task {
            do {
                _ = try await signer.sendTokens(
                    to: toAddress,
                    amount: "1000000", // 1 token in micro units
                    denom: denom,
                    memo: "Test transaction from Para Swift SDK - \(getCurrentChainInfo())",
                    signingMethod: selectedSigningMethod,
                )
                result = ("Success", "Transaction signed successfully using \(selectedSigningMethod.rawValue.uppercased()) method on \(getCurrentChainInfo())")
            } catch {
                result = ("Error", "Failed to sign transaction: \(error.localizedDescription)")
            }
            isLoading = false
        }
    }

    private func getDenomForChain() -> String {
        let (chainId, _, _) = getChainConfig()
        switch chainId {
        case "cosmoshub-4": return "uatom"
        case "osmosis-1": return "uosmo"
        case "juno-1": return "ujuno"
        case "stargaze-1": return "ustars"
        default: return "uatom" // Default fallback
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
                            Text("\(balanceString) \(getDenomForChain())")
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

                // Chain Configuration
                VStack(spacing: 16) {
                    Text("Chain Configuration")
                        .font(.headline)
                        .frame(maxWidth: .infinity, alignment: .leading)

                    Toggle("Use Custom Configuration", isOn: $useCustomConfig)
                        .accessibilityIdentifier("customConfigToggle")
                        .onChange(of: useCustomConfig) { _ in
                            reinitializeSigner()
                        }

                    if !useCustomConfig {
                        // Preset chains picker
                        Picker("Select Chain", selection: $selectedChain) {
                            ForEach(commonChains, id: \.1) { chain in
                                Text(chain.0).tag(chain.1)
                            }
                        }
                        .pickerStyle(.menu)
                        .accessibilityIdentifier("chainPicker")
                        .onChange(of: selectedChain) { _ in
                            reinitializeSigner()
                        }
                    } else {
                        // Custom configuration fields
                        VStack(spacing: 12) {
                            VStack(alignment: .leading, spacing: 4) {
                                Text("Chain ID")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                                TextField("e.g., cosmoshub-4", text: $customChainId)
                                    .textFieldStyle(.roundedBorder)
                                    .autocapitalization(.none)
                            }

                            VStack(alignment: .leading, spacing: 4) {
                                Text("Address Prefix")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                                TextField("e.g., cosmos", text: $customPrefix)
                                    .textFieldStyle(.roundedBorder)
                                    .autocapitalization(.none)
                            }

                            VStack(alignment: .leading, spacing: 4) {
                                Text("RPC URL (Optional)")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                                TextField("https://rpc.cosmos.network", text: $customRpcUrl)
                                    .textFieldStyle(.roundedBorder)
                                    .autocapitalization(.none)
                                    .keyboardType(.URL)
                            }

                            Button("Apply Configuration") {
                                reinitializeSigner()
                            }
                            .buttonStyle(.bordered)
                            .disabled(customChainId.isEmpty || customPrefix.isEmpty)
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

                    // Signing Method Selection
                    VStack(spacing: 8) {
                        Text("Signing Method")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .frame(maxWidth: .infinity, alignment: .leading)

                        Picker("Signing Method", selection: $selectedSigningMethod) {
                            Text("Proto (Modern)").tag(CosmosSigningMethod.proto)
                            Text("Amino (Legacy)").tag(CosmosSigningMethod.amino)
                        }
                        .pickerStyle(.segmented)
                    }

                    Button("Sign Transaction") {
                        createAndSignTransaction()
                    }
                    .buttonStyle(.bordered)
                    .frame(maxWidth: .infinity)
                    .disabled(isLoading || paraCosmosSigner == nil)

                    // Show current chain info
                    if let signer = paraCosmosSigner {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Current Chain: \(getCurrentChainInfo())")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
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
                        .accessibilityIdentifier("checkSessionButton")

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
                        .accessibilityIdentifier("fetchWalletsButton")
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
            set: { _ in result = nil },
        )) { alert in
            Alert(
                title: Text(alert.title),
                message: Text(alert.message),
                dismissButton: .default(Text("OK")),
            )
        }
        .onAppear {
            initializeSigner()
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

    private func initializeSigner() {
        Task {
            isLoading = true
            do {
                let (chainId, prefix, rpcUrl) = getChainConfig()

                let signer = try ParaCosmosSigner(
                    paraManager: paraManager,
                    chainId: chainId,
                    rpcUrl: rpcUrl.isEmpty ? "https://rpc.cosmos.directory:443/cosmoshub" : rpcUrl,
                    prefix: prefix,
                )

                try await signer.selectWallet(walletId: selectedWallet.id)

                // Get the chain-specific address from the signer
                let chainSpecificAddress = try await signer.getAddress()

                await MainActor.run {
                    paraCosmosSigner = signer
                    cosmosAddress = chainSpecificAddress
                }
            } catch {
                result = ("Error", "Failed to initialize Cosmos signer: \(error.localizedDescription)")
            }
            isLoading = false
        }
    }

    private func reinitializeSigner() {
        paraCosmosSigner = nil
        initializeSigner()
    }

    private func getChainConfig() -> (chainId: String, prefix: String, rpcUrl: String) {
        if useCustomConfig {
            return (customChainId, customPrefix, customRpcUrl)
        } else {
            if let chain = commonChains.first(where: { $0.1 == selectedChain }) {
                return (chain.1, chain.2, chain.3)
            }
            // Default to Cosmos Hub
            return ("cosmoshub-4", "cosmos", "https://cosmos-rpc.polkachu.com")
        }
    }

    private func getCurrentChainInfo() -> String {
        let (chainId, prefix, _) = getChainConfig()
        if let chainName = commonChains.first(where: { $0.1 == chainId })?.0 {
            return "\(chainName) (\(prefix)1...)"
        }
        return "\(chainId) (\(prefix)1...)"
    }
}

#Preview {
    CosmosWalletView(selectedWallet: ParaSwift.Wallet(result: [
        "id": "preview-wallet-id",
        "address": "0x1234567890123456789012345678901234567890",
        "addressSecondary": "cosmos1ey69r37gfxvxg62sh4r0ktpuc46pzjrm873ae8",
        "type": "COSMOS",
        "publicKey": "preview-public-key",
    ]))
}
