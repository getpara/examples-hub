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
    @State private var isLoading = false
    @State private var balance: String?
    @State private var cosmosAddress: String?
    @State private var selectedSigningMethod: CosmosSigningMethod = .proto
    @State private var selectedChain = "provider"
    @State private var customChainId = ""
    @State private var customPrefix = ""
    @State private var customRpcUrl = ""
    @State private var useCustomConfig = false
    @State private var paraCosmosSigner: ParaCosmosSigner?
    
    // MARK: - Constants
    private static let defaultAmount = "1000000" // 1 token in micro units
    private static let defaultRpcUrl = "https://rpc.cosmos.directory:443/cosmoshub"
    
    private let commonChains = [
        ("Cosmos Testnet", "provider", "cosmos", "https://rpc.provider-sentry-01.ics-testnet.polypore.xyz"),
        ("Osmosis Testnet", "osmo-test-5", "osmo", "https://rpc.testnet.osmosis.zone"),
        ("Cosmos Hub", "cosmoshub-4", "cosmos", "https://cosmos-rpc.polkachu.com"),
        ("Osmosis", "osmosis-1", "osmo", "https://osmosis-rpc.polkachu.com"),
        ("Juno", "juno-1", "juno", "https://juno-rpc.polkachu.com"),
        ("Stargaze", "stargaze-1", "stars", "https://stargaze-rpc.polkachu.com"),
    ]
    
    private let testAddresses: [String: String] = [
        "provider": "cosmos1v9yrqx8aaddlna29zxngr4ye3jnxtpprk8s7c2",
        "osmo-test-5": "osmo1v9yrqx8aaddlna29zxngr4ye3jnxtpprrej532",
        "cosmoshub-4": "cosmos1v9yrqx8aaddlna29zxngr4ye3jnxtpprk8s7c2",
        "osmosis-1": "osmo1v9yrqx8aaddlna29zxngr4ye3jnxtpprrej532",
        "juno-1": "juno1v9yrqx8aaddlna29zxngr4ye3jnxtpprlpedst",
        "stargaze-1": "stars1v9yrqx8aaddlna29zxngr4ye3jnxtppryhszrs"
    ]
    
    private let denomMappings: [String: String] = [
        "provider": "uatom",
        "osmo-test-5": "uosmo",
        "cosmoshub-4": "uatom",
        "osmosis-1": "uosmo",
        "juno-1": "ujuno",
        "stargaze-1": "ustars"
    ]
    
    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                walletAddressCard
                messageSigningCard
                chainConfigurationCard
                transactionOperationsCard
                walletManagementCard
                logoutButton
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
        .onAppear { initializeSigner() }
        .overlay {
            if isLoading {
                ZStack {
                    Color.black.opacity(0.2)
                    ProgressView().scaleEffect(1.5)
                }
                .ignoresSafeArea()
            }
        }
    }
    
    // MARK: - UI Components
    private var walletAddressCard: some View {
        CardView {
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
                    
                    Button(action: copyAddress) {
                        Image(systemName: "doc.on.doc")
                            .font(.footnote)
                    }
                    .buttonStyle(.borderless)
                    .accessibilityIdentifier("copyAddressButton")
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(10)
                
                if let balance = balance {
                    HStack {
                        Text("Balance:")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                        Spacer()
                        Text("\(balance) \(getCurrentDenom())")
                            .font(.system(.subheadline, design: .monospaced))
                    }
                    .padding(.horizontal)
                    .padding(.top, 8)
                }
                
                Button("Fetch Balance", action: fetchBalance)
                    .disabled(isLoading)
                    .padding(.horizontal)
                    .padding(.bottom, 8)
            }
        }
    }
    
    private var messageSigningCard: some View {
        CardView {
            VStack(spacing: 16) {
                Text("Message Signing")
                    .font(.headline)
                    .frame(maxWidth: .infinity, alignment: .leading)
                
                TextField("Enter a message to sign", text: $messageToSign)
                    .autocorrectionDisabled()
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(10)
                
                Button("Sign Message", action: signMessage)
                    .buttonStyle(.borderedProminent)
                    .disabled(isLoading || messageToSign.isEmpty)
                    .frame(maxWidth: .infinity)
            }
        }
    }
    
    private var chainConfigurationCard: some View {
        CardView {
            VStack(spacing: 16) {
                Text("Chain Configuration")
                    .font(.headline)
                    .frame(maxWidth: .infinity, alignment: .leading)
                
                Toggle("Use Custom Configuration", isOn: $useCustomConfig)
                    .accessibilityIdentifier("customConfigToggle")
                    .onChange(of: useCustomConfig) { _ in reinitializeSigner() }
                
                if useCustomConfig {
                    customConfigurationFields
                } else {
                    presetChainPicker
                }
            }
        }
    }
    
    private var customConfigurationFields: some View {
        VStack(spacing: 12) {
            ConfigField(title: "Chain ID", text: $customChainId, placeholder: "e.g., cosmoshub-4")
            ConfigField(title: "Address Prefix", text: $customPrefix, placeholder: "e.g., cosmos")
            ConfigField(title: "RPC URL (Optional)", text: $customRpcUrl, placeholder: "https://rpc.cosmos.network", keyboardType: .URL)
            
            Button("Apply Configuration", action: reinitializeSigner)
                .buttonStyle(.bordered)
                .disabled(customChainId.isEmpty || customPrefix.isEmpty)
        }
    }
    
    private var presetChainPicker: some View {
        Picker("Select Chain", selection: $selectedChain) {
            ForEach(commonChains, id: \.1) { chain in
                Text(chain.0).tag(chain.1)
            }
        }
        .pickerStyle(.menu)
        .accessibilityIdentifier("chainPicker")
        .onChange(of: selectedChain) { _ in reinitializeSigner() }
    }
    
    private var transactionOperationsCard: some View {
        CardView {
            VStack(spacing: 16) {
                Text("Transaction Operations")
                    .font(.headline)
                    .frame(maxWidth: .infinity, alignment: .leading)
                
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
                
                HStack(spacing: 12) {
                    Button("Sign Transaction", action: signTransaction)
                        .buttonStyle(.bordered)
                        .frame(maxWidth: .infinity)
                        .disabled(isLoading || paraCosmosSigner == nil)
                    
                    Button("Send Transaction", action: sendTransaction)
                        .buttonStyle(.borderedProminent)
                        .frame(maxWidth: .infinity)
                        .disabled(isLoading || paraCosmosSigner == nil)
                }
                
                if paraCosmosSigner != nil {
                    Text("Current Chain: \(getCurrentChainInfo())")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
        }
    }
    
    private var walletManagementCard: some View {
        CardView {
            VStack(spacing: 16) {
                Text("Wallet Management")
                    .font(.headline)
                    .frame(maxWidth: .infinity, alignment: .leading)
                
                HStack(spacing: 16) {
                    Button("Check Session", action: checkSession)
                        .buttonStyle(.bordered)
                        .frame(maxWidth: .infinity)
                        .accessibilityIdentifier("checkSessionButton")
                    
                    Button("Fetch Wallets", action: fetchWallets)
                        .buttonStyle(.bordered)
                        .frame(maxWidth: .infinity)
                        .accessibilityIdentifier("fetchWalletsButton")
                }
                .disabled(isLoading)
            }
        }
    }
    
    private var logoutButton: some View {
        Button("Logout", action: logout)
            .buttonStyle(.bordered)
            .tint(.red)
            .disabled(isLoading)
            .padding(.top, 12)
    }
    
    // MARK: - Actions
    private func copyAddress() {
        guard let address = cosmosAddress else {
            showResult("Error", "No address to copy")
            return
        }
        UIPasteboard.general.string = address
        showResult("Success", "Address copied to clipboard")
    }
    
    private func fetchBalance() {
        performAsyncOperation { signer in
            let amount = try await signer.getBalance()
            await MainActor.run { balance = amount }
            showResult("Success", "Balance fetched successfully")
        }
    }
    
    private func signMessage() {
        performAsyncOperation { signer in
            _ = try await signer.signMessage(messageToSign)
            showResult("Success", "Message signed successfully")
        }
    }
    
    private func signTransaction() {
        performTransactionOperation { signer, toAddress, denom in
            _ = try await signer.signTransaction(
                to: toAddress,
                amount: Self.defaultAmount,
                denom: denom,
                memo: "Test transaction from Para Swift SDK - \(getCurrentChainInfo())",
                signingMethod: selectedSigningMethod
            )
            showResult("Success", "Transaction signed successfully using \(selectedSigningMethod.rawValue.uppercased()) method on \(getCurrentChainInfo())")
        }
    }
    
    private func sendTransaction() {
        performTransactionOperation { signer, toAddress, denom in
            let txHash = try await signer.sendTransaction(
                to: toAddress,
                amount: Self.defaultAmount,
                denom: denom,
                memo: "Test broadcast from Para Swift SDK - \(getCurrentChainInfo())",
                signingMethod: selectedSigningMethod
            )
            showResult("Success", "Transaction broadcast successfully!\nTx Hash: \(txHash)\nMethod: \(selectedSigningMethod.rawValue.uppercased())\nChain: \(getCurrentChainInfo())")
        }
    }
    
    private func checkSession() {
        isLoading = true
        Task {
            do {
                let active = try await paraManager.isSessionActive()
                showResult("Session Status", "Session Active: \(active)")
            } catch {
                showResult("Error", "Failed to check session: \(error.localizedDescription)")
            }
            isLoading = false
        }
    }
    
    private func fetchWallets() {
        isLoading = true
        Task {
            do {
                let wallets = try await paraManager.fetchWallets()
                let addresses = wallets.map { $0.address ?? "No Address" }
                showResult("Wallets", addresses.joined(separator: "\n"))
            } catch {
                showResult("Error", "Failed to fetch wallets: \(error.localizedDescription)")
            }
            isLoading = false
        }
    }
    
    private func logout() {
        isLoading = true
        Task {
            do {
                try await paraManager.logout()
                appRootManager.currentRoot = .authentication
            } catch {
                showResult("Error", "Failed to logout: \(error.localizedDescription)")
            }
            isLoading = false
        }
    }
    
    // MARK: - Helper Methods
    private func performAsyncOperation(_ operation: @escaping (ParaCosmosSigner) async throws -> Void) {
        guard let signer = paraCosmosSigner else {
            showResult("Error", "Cosmos signer not initialized")
            return
        }
        
        isLoading = true
        Task {
            do {
                try await operation(signer)
            } catch {
                showResult("Error", "Operation failed: \(error.localizedDescription)")
            }
            isLoading = false
        }
    }
    
    private func performTransactionOperation(_ operation: @escaping (ParaCosmosSigner, String, String) async throws -> Void) {
        let (chainId, _, _) = getChainConfig()
        let denom = getCurrentDenom()
        let toAddress = getTestAddress(for: chainId)
        
        performAsyncOperation { signer in
            try await operation(signer, toAddress, denom)
        }
    }
    
    private func showResult(_ title: String, _ message: String) {
        result = (title, message)
    }
    
    private func getCurrentDenom() -> String {
        let (chainId, _, _) = getChainConfig()
        return denomMappings[chainId] ?? "uatom"
    }
    
    private func getTestAddress(for chainId: String) -> String {
        testAddresses[chainId] ?? testAddresses["provider"]!
    }
    
    private func initializeSigner() {
        Task {
            isLoading = true
            do {
                let (chainId, prefix, rpcUrl) = getChainConfig()
                
                let signer = try ParaCosmosSigner(
                    paraManager: paraManager,
                    chainId: chainId,
                    rpcUrl: rpcUrl.isEmpty ? Self.defaultRpcUrl : rpcUrl,
                    prefix: prefix
                )
                
                try await signer.selectWallet(walletId: selectedWallet.id)
                let chainSpecificAddress = try await signer.getAddress()
                
                await MainActor.run {
                    paraCosmosSigner = signer
                    cosmosAddress = chainSpecificAddress
                }
            } catch {
                showResult("Error", "Failed to initialize Cosmos signer: \(error.localizedDescription)")
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
            return ("provider", "cosmos", "https://rpc.provider-sentry-01.ics-testnet.polypore.xyz")
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

// MARK: - Helper Views
struct CardView<Content: View>: View {
    let content: Content
    
    init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }
    
    var body: some View {
        VStack { content }
            .padding()
            .background(Color(.systemBackground))
            .cornerRadius(16)
            .shadow(color: Color.black.opacity(0.05), radius: 5, x: 0, y: 2)
    }
}

struct ConfigField: View {
    let title: String
    @Binding var text: String
    let placeholder: String
    var keyboardType: UIKeyboardType = .default
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
            TextField(placeholder, text: $text)
                .textFieldStyle(.roundedBorder)
                .autocapitalization(.none)
                .keyboardType(keyboardType)
        }
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