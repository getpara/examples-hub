import ParaSwift
import SwiftUI

struct SolanaWalletView: View {
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

    // Removed ParaSolanaSigner - now using unified API

    // Solana RPC URL (devnet for testing)
    private let rpcUrl = "https://api.devnet.solana.com"

    // Helper function to measure operation time
    private func measureTime(_ operation: () async throws -> Void) async -> (TimeInterval, Error?) {
        let start = Date()
        do {
            try await operation()
            return (Date().timeIntervalSince(start), nil)
        } catch {
            return (Date().timeIntervalSince(start), error)
        }
    }

    private func fetchBalance() {
        Task {
            do {
                // Using unified getBalance API with RPC URL
                // For Solana devnet (testing)
                let rpcUrl = "https://api.devnet.solana.com"
                // For mainnet with API key (production):
                // let rpcUrl = "https://solana-mainnet.g.alchemy.com/v2/YOUR_API_KEY"
                
                let balanceString = try await paraManager.getBalance(
                    walletId: selectedWallet.id,
                    token: nil, // Native SOL balance
                    rpcUrl: rpcUrl // Pass RPC to avoid 403/CORS issues
                )
                // Balance is returned as a string, parse if needed
                if let balanceValue = Double(balanceString) {
                    let solBalance = balanceValue / 1_000_000_000 // lamportsPerSol conversion
                    balance = String(format: "%.4f SOL", solBalance)
                } else {
                    balance = balanceString // Use as-is if parsing fails
                }
            } catch {
                result = ("Error", "Failed to fetch balance: \(error.localizedDescription)")
            }
        }
    }

    private func signTransaction() {
        guard let transaction = createTransaction(lamports: 1_000_000) else { return }

        isLoading = true
        Task {
            let (duration, error) = await measureTime {
                // Pass RPC URL to avoid needing to include recentBlockhash
                let rpcUrl = "https://api.devnet.solana.com"
                // For mainnet: "https://solana-mainnet.g.alchemy.com/v2/YOUR_API_KEY"
                
                // Pass the transaction object directly - bridge will format it
                _ = try await paraManager.signTransaction(
                    walletId: selectedWallet.id,
                    transaction: transaction,
                    chainId: nil, // Not needed for Solana
                    rpcUrl: rpcUrl // Pass RPC for blockhash fetching
                )
            }

            if let error {
                result = ("Error", "Failed to sign transaction: \(error.localizedDescription)\nDuration: \(String(format: "%.2f", duration))s")
            } else {
                result = ("Success", "Transaction signed successfully\nDuration: \(String(format: "%.2f", duration))s")
            }
            isLoading = false
        }
    }

    private func sendTransaction() {
        guard let transaction = createTransaction(lamports: 100_000) else { return }

        // Check if we have balance info and sufficient funds
        if let balanceString = balance {
            // Extract numeric value from balance string (e.g., "0.0000 SOL" -> 0.0)
            let balanceValue = balanceString.replacingOccurrences(of: " SOL", with: "")
            if let balanceDouble = Double(balanceValue) {
                let requiredSOL = 0.0001 + 0.000005 // Transaction amount + estimated fee
                if balanceDouble < requiredSOL {
                    result = ("Insufficient Balance",
                              "You need at least \(String(format: "%.6f", requiredSOL)) SOL to send this transaction.\n\n" +
                                  "Current balance: \(balanceString)\n\n" +
                                  "To fund your wallet on Solana Devnet:\n" +
                                  "1. Copy your wallet address\n" +
                                  "2. Visit https://faucet.solana.com\n" +
                                  "3. Paste your address and request SOL")
                    return
                }
            }
        }

        isLoading = true
        Task {
            let (duration, error) = await measureTime {
                // Using the high-level transfer method
                _ = try await paraManager.transfer(
                    walletId: selectedWallet.id,
                    to: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
                    amount: "100000", // Lamports
                    token: nil // Native SOL transfer
                )
            }

            if let error {
                let errorMessage = error.localizedDescription
                if errorMessage.contains("insufficient") || errorMessage.contains("0x1") {
                    result = ("Insufficient Balance",
                              "Transaction failed due to insufficient balance.\n\n" +
                                  "To fund your wallet on Solana Devnet:\n" +
                                  "1. Copy your wallet address\n" +
                                  "2. Visit https://faucet.solana.com\n" +
                                  "3. Paste your address and request SOL\n\n" +
                                  "Duration: \(String(format: "%.2f", duration))s")
                } else {
                    result = ("Error", "Failed to send transaction: \(errorMessage)\nDuration: \(String(format: "%.2f", duration))s")
                }
            } else {
                result = ("Success", "Transaction sent successfully\nDuration: \(String(format: "%.2f", duration))s")
                // Refresh balance after successful transaction
                fetchBalance()
            }
            isLoading = false
        }
    }

    private func createTransaction(lamports: UInt64) -> SolanaTransaction? {
        // Create a simple transfer transaction for demo purposes
        let toAddress = "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM"

        do {
            return try SolanaTransaction(
                to: toAddress,
                lamports: lamports,
            )
        } catch {
            result = ("Error", "Failed to create transaction: \(error.localizedDescription)")
            return nil
        }
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Wallet Address & Balance Card
                VStack(spacing: 12) {
                    Text("Wallet Address")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .frame(maxWidth: .infinity, alignment: .leading)

                    HStack {
                        Text(selectedWallet.address ?? "No wallet found")
                            .font(.system(.footnote, design: .monospaced))
                            .lineLimit(1)
                            .truncationMode(.middle)

                        Spacer()

                        Button(action: {
                            if let address = selectedWallet.address {
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
                                .foregroundColor(.secondary)
                            Text(balanceString)
                                .bold()
                            Spacer()
                            Button(action: fetchBalance) {
                                Image(systemName: "arrow.clockwise")
                            }
                            .buttonStyle(.borderless)
                            .accessibilityIdentifier("refreshBalanceButton")
                        }
                        .padding(.vertical, 8)

                        // Show fund wallet button if balance is zero or very low
                        let balanceValue = balanceString.replacingOccurrences(of: " SOL", with: "")
                        if let balanceDouble = Double(balanceValue), balanceDouble < 0.001 {
                            Button(action: {
                                if let address = selectedWallet.address {
                                    UIPasteboard.general.string = address
                                    result = ("Wallet Address Copied",
                                              "Your address has been copied to clipboard.\n\n" +
                                                  "To fund your wallet:\n" +
                                                  "1. Visit https://faucet.solana.com\n" +
                                                  "2. Paste your address: \(address)\n" +
                                                  "3. Request SOL from the faucet\n\n" +
                                                  "Note: Devnet SOL has no real value")
                                }
                            }) {
                                Label("Fund Wallet (Devnet)", systemImage: "plus.circle.fill")
                            }
                            .buttonStyle(.borderedProminent)
                            .controlSize(.small)
                            .frame(maxWidth: .infinity)
                        }
                    } else {
                        Button("Fetch Balance") {
                            fetchBalance()
                        }
                        .buttonStyle(.bordered)
                        .frame(maxWidth: .infinity, alignment: .trailing)
                    }
                }
                .padding()
                .background(Color(.systemBackground))
                .cornerRadius(16)
                .shadow(color: Color.black.opacity(0.05), radius: 5, x: 0, y: 2)

                // Signing Messages
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
                        isSigning = true
                        Task {
                            let (duration, error) = await measureTime {
                                // Using the new unified signMessage API
                                _ = try await paraManager.signMessage(
                                    walletId: selectedWallet.id,
                                    message: messageToSign // Pass plain text directly
                                )
                            }

                            isSigning = false
                            if let error {
                                result = ("Error", "Failed to sign message: \(error.localizedDescription)\nDuration: \(String(format: "%.2f", duration))s")
                            } else {
                                result = ("Success", "Message signed successfully\nDuration: \(String(format: "%.2f", duration))s")
                            }
                        }
                    }
                    .buttonStyle(.borderedProminent)
                    .disabled(isSigning || messageToSign.isEmpty)
                    .frame(maxWidth: .infinity)
                    .overlay {
                        if isSigning {
                            ProgressView()
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

                    HStack(spacing: 16) {
                        Button("Send Transaction") {
                            sendTransaction()
                        }
                        .buttonStyle(.bordered)
                        .frame(maxWidth: .infinity)
                        .accessibilityIdentifier("Send Transaction")

                        Button("Sign Transaction") {
                            signTransaction()
                        }
                        .buttonStyle(.bordered)
                        .frame(maxWidth: .infinity)
                        .accessibilityIdentifier("Sign Transaction")
                    }
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
            }
            .padding(.horizontal)
        }
        .navigationTitle("Solana Wallet")
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
            // No signer initialization needed - using unified API
            fetchBalance()
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
    let mockParaManager = ParaManager(environment: .sandbox, apiKey: "preview-key")
    let mockWallet = ParaSwift.Wallet(
        id: "preview-wallet-id",
        signer: "mock-signer",
        address: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
        publicKey: "mock-public-key",
    )

    NavigationStack {
        SolanaWalletView(selectedWallet: mockWallet)
            .environmentObject(mockParaManager)
            .environmentObject(AppRootManager())
    }
}
