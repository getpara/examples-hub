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
    @State private var selectedSigningMethod: String = "proto"
    @State private var selectedChain = "cosmoshub-4"
    @State private var customChainId = ""
    @State private var customPrefix = ""
    @State private var customRpcUrl = ""
    @State private var useCustomConfig = false
    // Removed ParaCosmosSigner - now using unified API

    // MARK: - Constants

    private static let defaultAmount = "1000000" // 1 token in micro units
    private static let defaultRpcUrl = "https://cosmos-rpc.publicnode.com"

    private let commonChains = [
        ("Cosmos Hub", "cosmoshub-4", "cosmos", "https://cosmos-rpc.publicnode.com"),
        ("Osmosis", "osmosis-1", "osmo", "https://osmosis-rpc.publicnode.com"),
        ("Juno", "juno-1", "juno", "https://rpc-juno.itastakers.com"),
        ("Stargaze", "stargaze-1", "stars", "https://rpc.stargaze-apis.com"),
        ("Cosmos Testnet", "provider", "cosmos", "https://rpc.provider-state-sync-01.rs-testnet.polypore.xyz"),
        ("Osmosis Testnet", "osmo-test-5", "osmo", "https://rpc.testnet.osmosis.zone"),
    ]

    private let testAddresses: [String: String] = [
        "provider": "cosmos1v9yrqx8aaddlna29zxngr4ye3jnxtpprk8s7c2",
        "osmo-test-5": "osmo1v9yrqx8aaddlna29zxngr4ye3jnxtpprrej532",
        "cosmoshub-4": "cosmos1v9yrqx8aaddlna29zxngr4ye3jnxtpprk8s7c2",
        "osmosis-1": "osmo1v9yrqx8aaddlna29zxngr4ye3jnxtpprrej532",
        "juno-1": "juno1v9yrqx8aaddlna29zxngr4ye3jnxtpprlpedst",
        "stargaze-1": "stars1v9yrqx8aaddlna29zxngr4ye3jnxtppryhszrs",
    ]

    private let denomMappings: [String: String] = [
        "provider": "uatom",
        "osmo-test-5": "uosmo",
        "cosmoshub-4": "uatom",
        "osmosis-1": "uosmo",
        "juno-1": "ujuno",
        "stargaze-1": "ustars",
    ]

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                walletAddressCard
                chainConfigurationCard
                messageSigningCard
                transactionOperationsCard
            }
            .padding(.horizontal)
        }
        .navigationTitle("Cosmos Wallet")
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                SigningExamplesToolbarLink(wallet: selectedWallet)
            }
        }
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

                if let balance {
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

                HStack(spacing: 12) {
                    Button("Sign Proto", action: testSignDirect)
                        .buttonStyle(.bordered)
                        .frame(maxWidth: .infinity)
                        .disabled(isLoading)
                        .accessibilityIdentifier("Sign Transaction")

                    Button("Sign Amino", action: testSignAmino)
                        .buttonStyle(.bordered)
                        .frame(maxWidth: .infinity)
                        .disabled(isLoading)
                        .accessibilityIdentifier("Sign Amino")
                }

                if true { // Always show signing options with unified API
                    Text("Current Chain: \(getCurrentChainInfo())")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
        }
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
        isLoading = true
        Task {
            do {
                // Get chain configuration including prefix for proper address derivation
                let (_, chainPrefix, rpcUrl) = getChainConfig()
                
                // Using unified getBalance API with RPC URL and chain prefix
                // Chain prefix is critical for Cosmos to derive the correct bech32 address
                let amount = try await paraManager.getBalance(
                    walletId: selectedWallet.id,
                    token: nil, // Native token balance
                    rpcUrl: rpcUrl, // Pass RPC to avoid public endpoint issues
                    chainPrefix: chainPrefix // Pass prefix for correct address derivation (e.g., "stars" for Stargaze)
                )
                await MainActor.run { balance = amount }
                showResult("Success", "Balance fetched successfully")
            } catch {
                showResult("Error", "Failed to fetch balance: \(error.localizedDescription)")
            }
            isLoading = false
        }
    }

    private func signMessage() {
        isLoading = true
        Task {
            do {
                // Using unified signMessage API
                let signature = try await paraManager.signMessage(
                    walletId: selectedWallet.id,
                    message: messageToSign
                )
                showResult("Message Signed", "Message: \(messageToSign)\n\nSignature:\n\(signature.signedTransaction)")
            } catch {
                showResult("Error", "Failed to sign message: \(error.localizedDescription)")
            }
            isLoading = false
        }
    }

    private func testSignDirect() {
        isLoading = true
        Task {
            do {
                let (chainId, _, rpcUrl) = getChainConfig()
                let denom = getCurrentDenom()
                let toAddress = getTestAddress(for: chainId)
                
                // Create a proper Cosmos transaction with proto format
                let transaction = CosmosTransaction(
                    to: toAddress,
                    amount: "1000000", // 1 token in smallest denomination
                    denom: denom,
                    memo: "Test Proto Transaction",
                    chainId: chainId,
                    format: "proto"
                )
                
                // Using unified signTransaction API for proto signing with RPC
                let result = try await paraManager.signTransaction(
                    walletId: selectedWallet.id,
                    transaction: transaction,
                    chainId: chainId,
                    rpcUrl: rpcUrl // Pass RPC for any chain operations
                )
                
                showResult("✅ Proto Signed", "Direct signing completed!\n\n🔗 Chain: \(getCurrentChainInfo())\n🔐 Signature: \(String(result.signedTransaction.prefix(20)))...")
            } catch {
                showResult("Error", "Failed to sign: \(error.localizedDescription)")
            }
            isLoading = false
        }
    }

    private func testSignAmino() {
        isLoading = true
        Task {
            do {
                let (chainId, _, rpcUrl) = getChainConfig()
                let denom = getCurrentDenom()
                let toAddress = getTestAddress(for: chainId)
                
                // Create a proper Cosmos transaction with amino format
                let transaction = CosmosTransaction(
                    to: toAddress,
                    amount: "1000000", // 1 token in smallest denomination
                    denom: denom,
                    memo: "Test Amino Transaction",
                    chainId: chainId,
                    format: "amino"
                )
                
                // Using unified signTransaction API for amino signing with RPC
                let result = try await paraManager.signTransaction(
                    walletId: selectedWallet.id,
                    transaction: transaction,
                    chainId: chainId,
                    rpcUrl: rpcUrl // Pass RPC for any chain operations
                )
                
                showResult("✅ Amino Signed", "Legacy signing completed!\n\n🔗 Chain: \(getCurrentChainInfo())\n🔐 Signature: \(String(result.signedTransaction.prefix(20)))...")
            } catch {
                showResult("Error", "Failed to sign: \(error.localizedDescription)")
            }
            isLoading = false
        }
    }


    // MARK: - Helper Methods

    // Removed performAsyncOperation - no longer needed with unified API

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
        // No signer initialization needed - using unified API
        // Derive the correct bech32 address for the selected chain
        updateCosmosAddress()
    }

    private func reinitializeSigner() {
        // No signer to reinitialize - using unified API
        // Update address when chain changes
        updateCosmosAddress()
    }
    
    private func updateCosmosAddress() {
        // For Cosmos wallets, the address changes based on the chain prefix
        // The wallet stores a default address, but we need to show the chain-specific one
        let (_, chainPrefix, _) = getChainConfig()

        // Prefer the Cosmos-specific bech32 address if it exists, otherwise fall back to the primary one
        guard let baseAddress = selectedWallet.addressSecondary ?? selectedWallet.address else {
            cosmosAddress = nil
            return
        }

        // Replace the prefix before the first "1" delimiter so the displayed address matches the selected chain
        if let oneIndex = baseAddress.firstIndex(of: "1") {
            let suffix = baseAddress[oneIndex...]
            cosmosAddress = "\(chainPrefix)\(suffix)"
        } else {
            cosmosAddress = baseAddress
        }

        // Note: Proper address derivation happens in the bridge when making calls
        // The displayed address is for user reference
    }

    private func getChainConfig() -> (chainId: String, prefix: String, rpcUrl: String) {
        if useCustomConfig {
            return (customChainId, customPrefix, customRpcUrl)
        } else {
            if let chain = commonChains.first(where: { $0.1 == selectedChain }) {
                return (chain.1, chain.2, chain.3)
            }
            return ("cosmoshub-4", "cosmos", "https://cosmos-rpc.publicnode.com")
        }
    }

    private func getCurrentChainInfo() -> String {
        let (chainId, prefix, _) = getChainConfig()
        if let chainName = commonChains.first(where: { $0.1 == chainId })?.0 {
            return "\(chainName) (\(prefix)1...)"
        }
        return "\(chainId) (\(prefix)1...)"
    }

    private func createSampleProtoSignDoc() -> String {
        // For proto signing, we need actual protobuf-encoded bytes
        // This is a minimal valid SignDoc for demo purposes
        // In a real app, you'd use @cosmjs/proto-signing to construct this

        // Create a minimal but valid SignDoc structure
        // SignDoc has: body_bytes (field 1), auth_info_bytes (field 2), chain_id (field 3), account_number (field 4)
        // This represents an empty transaction with minimal required fields
        let (chainId, _, _) = getChainConfig()

        // Manually construct a minimal protobuf SignDoc
        // Field 1 (body_bytes): empty - tag 0x0A (field 1, wire type 2), length 0
        // Field 2 (auth_info_bytes): empty - tag 0x12 (field 2, wire type 2), length 0
        // Field 3 (chain_id): actual chain ID - tag 0x1A (field 3, wire type 2)
        // Field 4 (account_number): 0 - tag 0x20 (field 4, wire type 0), value 0

        var protobufBytes = Data()

        // body_bytes (empty)
        protobufBytes.append(0x0A) // tag
        protobufBytes.append(0x00) // length 0

        // auth_info_bytes (empty)
        protobufBytes.append(0x12) // tag
        protobufBytes.append(0x00) // length 0

        // chain_id
        protobufBytes.append(0x1A) // tag
        let chainIdData = chainId.data(using: .utf8)!
        protobufBytes.append(UInt8(chainIdData.count)) // length
        protobufBytes.append(chainIdData) // chain ID string

        // account_number (0)
        protobufBytes.append(0x20) // tag
        protobufBytes.append(0x00) // value 0

        return protobufBytes.base64EncodedString()
    }

    private func createSampleAminoSignDoc() -> String {
        // This creates a minimal amino SignDoc for demonstration purposes
        // In a real app, you'd construct this from actual transaction data
        let (chainId, _, _) = getChainConfig()
        let denom = getCurrentDenom()
        let toAddress = getTestAddress(for: chainId)

        // Simulate an amino SignDoc structure
        let aminoSignDoc: [String: Any] = [
            "chain_id": chainId,
            "account_number": "0",
            "sequence": "0",
            "fee": [
                "amount": [["denom": denom, "amount": "5000"]],
                "gas": "200000",
            ],
            "msgs": [[
                "type": "cosmos-sdk/MsgSend",
                "value": [
                    "from_address": "demo_from_address",
                    "to_address": toAddress,
                    "amount": [["denom": denom, "amount": Self.defaultAmount]],
                ],
            ]],
            "memo": "Demo amino signing from Para Swift SDK",
        ]

        do {
            let jsonData = try JSONSerialization.data(withJSONObject: aminoSignDoc)
            return jsonData.base64EncodedString()
        } catch {
            // Fallback to a simple base64 string for demo
            return "eyJ0ZXN0IjoidHJ1ZSJ9" // {"test":"true"} in base64
        }
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
