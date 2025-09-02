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
        // Create a simple transfer transaction for demo purposes
        let toAddress = "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM"
        let lamports: UInt64 = 1_000_000
        
        let transaction: SolanaTransaction
        do {
            transaction = try SolanaTransaction(
                to: toAddress,
                lamports: lamports
            )
        } catch {
            result = ("Error", "Failed to create transaction: \(error.localizedDescription)")
            return
        }

        isLoading = true
        Task {
            var signature: SignatureResult?
            let (duration, error) = await measureTime {
                // Pass RPC URL to avoid needing to include recentBlockhash
                let rpcUrl = "https://api.devnet.solana.com"
                // For mainnet: "https://solana-mainnet.g.alchemy.com/v2/YOUR_API_KEY"
                
                // Pass the transaction object directly - bridge will format it
                signature = try await paraManager.signTransaction(
                    walletId: selectedWallet.id,
                    transaction: transaction,
                    chainId: nil, // Not needed for Solana
                    rpcUrl: rpcUrl // Pass RPC for blockhash fetching
                )
            }

            if let error {
                result = ("Error", "Failed to sign transaction: \(error.localizedDescription)\nDuration: \(String(format: "%.2f", duration))s")
            } else if let sig = signature {
                result = ("Transaction Signed", "To: 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM\nAmount: 0.001 SOL (1,000,000 lamports)\nNetwork: Devnet\n\nSignature:\n\(sig.signedTransaction)\n\nDuration: \(String(format: "%.3f", duration))s")
            }
            isLoading = false
        }
    }

    private func signPreSerializedTransaction() {
        // This tests the new pre-serialized transaction signing feature
        isLoading = true
        Task {
            do {
                // In a real scenario, a customer would have a pre-serialized Solana transaction
                // from an external source (e.g., a dApp, another SDK, or a backend service).
                // 
                // This is a REAL base64-encoded Solana transaction message, exactly as produced
                // by transaction.serializeMessage() from @solana/web3.js
                
                // This transaction represents:
                // - Transfer: 1,000,000 lamports (0.001 SOL)
                // - To: 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM
                // - Recent blockhash: DWJ5ey2uFfQQvTkKVzpmDbZqWPNPtJ1ZPo7F8NMBhWTu
                // 
                // In production, this would come from:
                // - A dApp that constructs transactions
                // - A backend service that prepares transactions
                // - Another SDK that has already formatted the transaction
                
                // Real serialized Solana transaction (200 characters)
                let realSerializedTx = "AQABA8GlkLb8bd/L6i5/YftGpxyig/iBvof2eNEF9WPF2o0ZfowIh2C/3h3dzzLBfyCbgkLuUqrxMfrNiNDqLG0LBvIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOMy2vkvq+zotj/3pEAF5f39mvoVh1a2HFqV+QSzuNCBAQICAAEMAgAAAEBCDwAAAAAA"
                
                // Now test signing the pre-serialized transaction using the new extension
                var signature: SignatureResult?
                let (duration, error) = await measureTime {
                    // Test the new convenience method with the real serialized transaction
                    signature = try await paraManager.signSolanaSerializedTransaction(
                        walletId: selectedWallet.id,
                        base64Tx: realSerializedTx
                    )
                }
                
                if let error {
                    result = ("Error", "Failed to sign pre-serialized transaction: \(error.localizedDescription)\nDuration: \(String(format: "%.2f", duration))s")
                } else if let sig = signature {
                    result = ("Pre-Serialized Transaction Signed", 
                             "This demonstrates signing a pre-serialized base64 transaction\n\n" +
                             "Real serialized tx (first 50 chars):\n\(String(realSerializedTx.prefix(50)))...\n\n" +
                             "Signature:\n\(sig.signedTransaction)\n\n" +
                             "Duration: \(String(format: "%.3f", duration))s\n\n" +
                             "Note: In production, the base64 transaction would come from:\n" +
                             "• A dApp that constructs transactions\n" +
                             "• A backend service\n" +
                             "• Another SDK that has already formatted the transaction")
                }
            } catch {
                result = ("Error", "Failed to sign pre-serialized transaction: \(error.localizedDescription)")
            }
            isLoading = false
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
                            var signature: SignatureResult?
                            let (duration, error) = await measureTime {
                                // Using the new unified signMessage API
                                signature = try await paraManager.signMessage(
                                    walletId: selectedWallet.id,
                                    message: messageToSign // Pass plain text directly
                                )
                            }

                            isSigning = false
                            if let error {
                                result = ("Error", "Failed to sign message: \(error.localizedDescription)\nDuration: \(String(format: "%.2f", duration))s")
                            } else if let sig = signature {
                                result = ("Message Signed", "Message: \(messageToSign)\n\nSignature:\n\(sig.signedTransaction)\n\nDuration: \(String(format: "%.3f", duration))s")
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

                    Button("Sign Transaction") {
                        signTransaction()
                    }
                    .buttonStyle(.bordered)
                    .frame(maxWidth: .infinity)
                    .accessibilityIdentifier("Sign Transaction")
                    .disabled(isLoading)
                    
                    Button("Sign Pre-Serialized Transaction") {
                        signPreSerializedTransaction()
                    }
                    .buttonStyle(.bordered)
                    .frame(maxWidth: .infinity)
                    .accessibilityIdentifier("Sign Pre-Serialized Transaction")
                    .disabled(isLoading)
                    .foregroundColor(.orange)

                    Text("Tests signing a base64-encoded serialized transaction")
                        .font(.caption)
                        .foregroundColor(.secondary)
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
