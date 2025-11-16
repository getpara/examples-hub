import ParaSwift
import SwiftUI
import Foundation
import SolanaSwift

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

        isLoading = true
        Task {
            do {
                // Create a proper Solana transaction using Para SDK's SolanaTransaction
                let transaction = try ParaSwift.SolanaTransaction(
                    to: toAddress,
                    lamports: lamports
                )
                
                var signature: SignatureResult?
                let (duration, error) = await measureTime {
                    // Use the actual signTransaction API with the transaction object
                    signature = try await paraManager.signTransaction(
                        walletId: selectedWallet.id,
                        transaction: transaction,
                        rpcUrl: rpcUrl  // Pass RPC URL for fetching recent blockhash if needed
                    )
                }

                if let error {
                    result = ("Error", "Failed to sign transaction: \(error.localizedDescription)\nDuration: \(String(format: "%.2f", duration))s")
                } else if let sig = signature {
                    let details = """
                    ✅ Solana Transaction Signed Successfully
                    
                    Transaction Details:
                    • To: \(toAddress)
                    • Amount: 0.001 SOL (1,000,000 lamports)
                    • Network: Devnet
                    • Wallet Type: \(sig.type)
                    
                    Signed Transaction:
                    \(sig.signedTransaction)
                    
                    Performance: \(String(format: "%.3f", duration))s
                    
                    ✓ This transaction is ready to be broadcast to the Solana network
                    """
                    
                    result = ("Transaction Signed", details)
                }
            } catch {
                result = ("Error", "Failed to create or sign transaction: \(error.localizedDescription)")
            }
            isLoading = false
        }
    }

    private func signPreSerializedTransaction() {
        // This demonstrates signing a pre-serialized Solana transaction
        // Since we don't have SolanaSwift, we'll create a simple example transaction
        // In a real app, you would use a proper Solana library or construct the transaction manually
        isLoading = true
        Task {
            do {
                // Ensure we have a wallet address
                guard let walletAddress = selectedWallet.address else {
                    result = ("Error", "No wallet address available")
                    isLoading = false
                    return
                }
                
                // For demonstration, we'll create a simple base64-encoded transaction
                // In production, you would properly serialize a Solana transaction
                // This is a placeholder that shows how to use Para's signSolanaSerializedTransaction API
                
                // Example: Create a minimal transaction structure
                // Real Solana transactions require proper serialization with:
                // - Recent blockhash
                // - Instructions
                // - Signatures array
                // - Fee payer
                
                // For now, let's fetch a recent blockhash from RPC and create a demo transaction
                let recentBlockhash = try await fetchRecentBlockhash()
                
                // Create a simple transfer instruction placeholder
                // In production, use proper Solana transaction construction
                let toAddress = "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM"
                let lamports: UInt64 = 1_000_000
                
                // Create a real Solana transaction using SolanaSwift
                let transactionData = createDemoTransaction(
                    from: walletAddress,
                    to: toAddress,
                    lamports: lamports,
                    recentBlockhash: recentBlockhash
                )
                
                // Check if we got valid transaction data
                guard !transactionData.isEmpty else {
                    result = ("Error", "Failed to create transaction. Please check the addresses and try again.")
                    isLoading = false
                    return
                }
                
                let base64Transaction = transactionData.base64EncodedString()
                
                // Now sign the pre-serialized transaction using Para's API
                var signature: SignatureResult?
                let (duration, error) = await measureTime {
                    signature = try await paraManager.signSolanaSerializedTransaction(
                        walletId: selectedWallet.id,
                        base64Tx: base64Transaction
                    )
                }
                
                if let error {
                    result = ("Error", "Failed to sign transaction: \(error.localizedDescription)\nDuration: \(String(format: "%.2f", duration))s")
                } else if let sig = signature {
                    // Format the result with transaction details
                    let details = """
                    ✅ Solana Transaction Created and Signed Successfully
                    
                    Transaction Details:
                    • From: \(walletAddress)
                    • To: \(toAddress)
                    • Amount: 0.001 SOL (1,000,000 lamports)
                    • Network: Devnet
                    • Blockhash: \(recentBlockhash)
                    
                    Binary Transaction Info:
                    • Format: Solana wire protocol (binary)
                    • Size: \(transactionData.count) bytes
                    • Base64 encoded: \(base64Transaction.count) characters
                    • Transaction type: SystemProgram::Transfer
                    
                    Signed Transaction (Base64):
                    \(sig.signedTransaction)
                    
                    Performance: \(String(format: "%.3f", duration))s
                    
                    ✓ This is a real Solana transaction in binary format
                    ✓ Ready to be submitted to the Solana network
                    """
                    
                    result = ("Pre-Serialized Transaction Signed", details)
                }
            } catch {
                result = ("Error", "Failed to create or sign transaction: \(error.localizedDescription)")
            }
            isLoading = false
        }
    }
    
    // Helper function to fetch recent blockhash from Solana RPC
    private func fetchRecentBlockhash() async throws -> String {
        let url = URL(string: rpcUrl)!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body: [String: Any] = [
            "jsonrpc": "2.0",
            "id": 1,
            "method": "getLatestBlockhash",
            "params": [["commitment": "finalized"]]
        ]
        
        request.httpBody = try JSONSerialization.data(withJSONObject: body)
        
        let (data, _) = try await URLSession.shared.data(for: request)
        
        if let json = try JSONSerialization.jsonObject(with: data) as? [String: Any],
           let result = json["result"] as? [String: Any],
           let value = result["value"] as? [String: Any],
           let blockhash = value["blockhash"] as? String {
            return blockhash
        }
        
        throw NSError(domain: "SolanaError", code: 0, userInfo: [NSLocalizedDescriptionKey: "Failed to fetch blockhash"])
    }
    
    // Helper function to create a real Solana transaction using SolanaSwift
    private func createDemoTransaction(from: String, to: String, lamports: UInt64, recentBlockhash: String) -> Data {
        do {
            // Create PublicKey instances from the string addresses
            guard let fromPubkey = try? PublicKey(string: from),
                  let toPubkey = try? PublicKey(string: to) else {
                print("Failed to create public keys")
                return Data()
            }
            
            // Create the system program transfer instruction
            let transferInstruction = SystemProgram.transferInstruction(
                from: fromPubkey,
                to: toPubkey,
                lamports: lamports
            )
            
            // Create the transaction with the instruction
            var transaction = SolanaSwift.Transaction()
            transaction.instructions = [transferInstruction]
            transaction.recentBlockhash = recentBlockhash
            transaction.feePayer = fromPubkey
            
            // Serialize the transaction to binary format
            // This creates the actual Solana wire format transaction
            let serializedTransaction = try transaction.serialize(
                requiredAllSignatures: false,
                verifySignatures: false
            )
            
            return serializedTransaction
        } catch {
            print("Error creating Solana transaction: \(error)")
            return Data()
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
            // Fetch balance on appear
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
