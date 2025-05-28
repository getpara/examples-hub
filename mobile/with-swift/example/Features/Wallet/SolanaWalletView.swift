import SwiftUI
import ParaSwift

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
    
    @State private var paraSolanaSigner: ParaSolanaSigner?
    
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
        guard let signer = paraSolanaSigner else {
            result = ("Error", "Solana signer not initialized")
            return
        }
        
        Task {
            do {
                let balanceInLamports = try await signer.getBalance()
                let solBalance = Double(balanceInLamports) / 1_000_000_000 // lamportsPerSol conversion
                self.balance = String(format: "%.4f SOL", solBalance)
            } catch {
                result = ("Error", "Failed to fetch balance: \(error.localizedDescription)")
            }
        }
    }
    
    private func signTransaction() {
        guard let transaction = createTransaction(lamports: 1000000) else { return }
        guard let signer = paraSolanaSigner else {
            result = ("Error", "Solana signer not initialized")
            return
        }
        
        isLoading = true
        Task {
            let (duration, error) = await measureTime {
                _ = try await signer.signTransaction(transaction)
            }
            
            if let error = error {
                self.result = ("Error", "Failed to sign transaction: \(error.localizedDescription)\nDuration: \(String(format: "%.2f", duration))s")
            } else {
                self.result = ("Success", "Transaction signed successfully\nDuration: \(String(format: "%.2f", duration))s")
            }
            isLoading = false
        }
    }
    
    private func sendTransaction() {
        guard let transaction = createTransaction(lamports: 100000) else { return }
        guard let signer = paraSolanaSigner else {
            result = ("Error", "Solana signer not initialized")
            return
        }
        
        isLoading = true
        Task {
            let (duration, error) = await measureTime {
                _ = try await signer.sendTransaction(transaction)
            }
            
            if let error = error {
                self.result = ("Error", "Failed to send transaction: \(error.localizedDescription)\nDuration: \(String(format: "%.2f", duration))s")
            } else {
                self.result = ("Success", "Transaction sent successfully\nDuration: \(String(format: "%.2f", duration))s")
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
                lamports: lamports
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
                    
                    if balance != nil {
                        HStack {
                            Text("Balance:")
                                .foregroundColor(.secondary)
                            Text(balance!)
                                .bold()
                            Spacer()
                            Button(action: fetchBalance) {
                                Image(systemName: "arrow.clockwise")
                            }
                            .buttonStyle(.borderless)
                            .accessibilityIdentifier("refreshBalanceButton")
                        }
                        .padding(.vertical, 8)
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
                                let messageBytes = messageToSign.data(using: .utf8)
                                guard let base64Message = messageBytes?.base64EncodedString() else {
                                    throw ParaError.bridgeError("Failed to encode message.")
                                }
                                _ = try await paraManager.signMessage(walletId: selectedWallet.id, message: base64Message)
                            }
                            
                            isSigning = false
                            if let error = error {
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
                        
                        Button("Sign Transaction") {
                            signTransaction()
                        }
                        .buttonStyle(.bordered)
                        .frame(maxWidth: .infinity)
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
        .navigationTitle("Solana Wallet")
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
        .onAppear {
            Task {
                isLoading = true
                do {
                    // Initialize Para Solana signer with bridge pattern
                    let signer = try ParaSolanaSigner(
                        paraManager: paraManager,
                        rpcUrl: rpcUrl,
                        walletId: selectedWallet.id
                    )
                    
                    await MainActor.run {
                        self.paraSolanaSigner = signer
                        fetchBalance()
                    }
                } catch {
                    result = ("Error", "Failed to initialize Solana signer: \(error.localizedDescription)")
                }
                isLoading = false
            }
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

// Helper struct for alert binding
private struct AlertItem: Identifiable {
    let id = UUID()
    let title: String
    let message: String
}

#Preview {
    let mockParaManager = ParaManager(environment: .sandbox, apiKey: "preview-key")
    let mockWallet = ParaSwift.Wallet(
        id: "preview-wallet-id",
        signer: "mock-signer",
        address: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
        publicKey: "mock-public-key"
    )
    
    NavigationStack {
        SolanaWalletView(selectedWallet: mockWallet)
            .environmentObject(mockParaManager)
            .environmentObject(AppRootManager())
    }
}