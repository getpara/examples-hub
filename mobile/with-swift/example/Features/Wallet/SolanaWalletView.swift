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
                _ = try await signer.sendTransaction(transaction)
            }
            
            if let error = error {
                let errorMessage = error.localizedDescription
                if errorMessage.contains("insufficient") || errorMessage.contains("0x1") {
                    self.result = ("Insufficient Balance", 
                                 "Transaction failed due to insufficient balance.\n\n" +
                                 "To fund your wallet on Solana Devnet:\n" +
                                 "1. Copy your wallet address\n" +
                                 "2. Visit https://faucet.solana.com\n" +
                                 "3. Paste your address and request SOL\n\n" +
                                 "Duration: \(String(format: "%.2f", duration))s")
                } else {
                    self.result = ("Error", "Failed to send transaction: \(errorMessage)\nDuration: \(String(format: "%.2f", duration))s")
                }
            } else {
                self.result = ("Success", "Transaction sent successfully\nDuration: \(String(format: "%.2f", duration))s")
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
                        rpcUrl: rpcUrl
                    )
                    
                    // Explicitly select the wallet to ensure it's properly initialized
                    try await signer.selectWallet(walletId: selectedWallet.id)
                    
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