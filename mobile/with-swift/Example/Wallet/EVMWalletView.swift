import SwiftUI
import ParaSwift
import web3swift
import Web3Core
import BigInt

struct EVMWalletView: View {
    @EnvironmentObject var paraManager: ParaManager
    @EnvironmentObject var paraEvmSigner: ParaEvmSigner
    @EnvironmentObject var appRootManager: AppRootManager
    
    let selectedWallet: Wallet
    
    @State private var messageToSign = ""
    @State private var result: (title: String, message: String)?
    @State private var creatingWallet = false
    @State private var isSigning = false
    @State private var isFetching = false
    @State private var isLoading = false
    @State private var balance: String?
    
    private let web3: Web3
    
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
    
    init(selectedWallet: Wallet) {
        self.selectedWallet = selectedWallet
        // Initialize web3 with error handling in the view
        if let url = URL(string: "https://sepolia.infura.io/v3/961364684c7346c080994baab1469ea8") {
            self.web3 = Web3(provider: Web3HttpProvider(url: url, network: .Custom(networkID: 11155111)))
        } else {
            // Provide a meaningful error if URL is invalid
            self.web3 = Web3(provider: Web3HttpProvider(url: URL(string: "http://localhost:8545")!, network: .Custom(networkID: 11155111)))
        }
    }
    
    private func fetchBalance() {
        guard let address = selectedWallet.address,
              let ethAddress = EthereumAddress(address) else {
            result = ("Error", "Invalid wallet address")
            return
        }
        
        Task {
            do {
                let balance = try await web3.eth.getBalance(for: ethAddress)
                let ethBalance = Double(balance) / 1e18
                self.balance = String(format: "%.4f ETH", ethBalance)
            } catch {
                result = ("Error", "Failed to fetch balance: \(error.localizedDescription)")
            }
        }
    }
    
    private func signTransaction() {
        guard let transaction = createTransaction(value: "1000000000") else { return }
        
        isLoading = true
        Task {
            let (duration, error) = await measureTime {
                try await paraEvmSigner.signTransaction(transactionB64: transaction.b64Encoded())
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
        guard let transaction = createTransaction(value: "100000000000000") else { return }
        
        isLoading = true
        Task {
            let (duration, error) = await measureTime {
                try await paraEvmSigner.sendTransaction(transactionB64: transaction.b64Encoded())
            }
            
            if let error = error {
                self.result = ("Error", "Failed to send transaction: \(error.localizedDescription)\nDuration: \(String(format: "%.2f", duration))s")
            } else {
                self.result = ("Success", "Transaction sent successfully\nDuration: \(String(format: "%.2f", duration))s")
            }
            isLoading = false
        }
    }
    
    private func createTransaction(value: String) -> EVMTransaction? {
        func createBigUInt(_ string: String) -> BigUInt? {
            return BigUInt(string)
        }
        
        guard let value = createBigUInt(value),
              let gasLimit = createBigUInt("21000"),
              let maxPriorityFeePerGas = createBigUInt("1000000000"),
              let maxFeePerGas = createBigUInt("3000000000"),
              let nonce = createBigUInt("3"),
              let chainId = createBigUInt("11155111") else {
            self.result = ("Error", "Invalid numeric parameters for transaction")
            return nil
        }
        
        return EVMTransaction(
            to: "0x301d75d850c878b160ad9e1e3f6300202de9e97f",
            value: value,
            gasLimit: gasLimit,
            gasPrice: nil,
            maxPriorityFeePerGas: maxPriorityFeePerGas,
            maxFeePerGas: maxFeePerGas,
            nonce: nonce,
            chainId: chainId,
            smartContractAbi: "[{\"inputs\":[],\"name\":\"retrieve\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"num\",\"type\":\"uint256\"}],\"name\":\"store\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"}]",
            smartContractFunctionName: "",
            smartContractFunctionArgs: [],
            smartContractByteCode: "",
            type: 2
        )
    }
    
    var body: some View {
        ZStack {
            VStack(spacing: 20) {
                Text(selectedWallet.address ?? "No wallet found")
                    .font(.system(.callout, design: .monospaced))
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(8)
                
                if let balance {
                    Text(balance)
                        .font(.body)
                        .padding(.horizontal)
                }
                
                TextField("Enter a message to sign", text: $messageToSign)
                    .autocorrectionDisabled()
                    .textFieldStyle(.roundedBorder)
                    .padding(.horizontal)
                
                // Fixed height container for sign message loading
                ZStack {
                    if isSigning {
                        ProgressView("Signing message...")
                    }
                }
                .frame(height: 20) // Fixed height for loading indicator
                
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
                .padding(.horizontal)
                
                // Fixed height container for fetch loading
                ZStack {
                    if isFetching {
                        ProgressView("Fetching wallets...")
                    }
                }
                .frame(height: 20) // Fixed height for loading indicator
                
                // Buttons for session/wallet actions
                HStack {
                    Button("Check Session Active") {
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
                    
                    Button("Copy Address") {
                        if let address = selectedWallet.address {
                            UIPasteboard.general.string = address
                            result = ("Success", "Address copied to clipboard")
                        } else {
                            result = ("Error", "No address to copy")
                        }
                    }
                    .buttonStyle(.bordered)
                }
                
                HStack {
                    Button("Fetch Balance") {
                        fetchBalance()
                    }
                    .buttonStyle(.bordered)
                    
                    Button("EVM Send Tx") {
                        sendTransaction()
                    }
                    .buttonStyle(.bordered)
                    
                    Button("EVM Sign Tx") {
                        signTransaction()
                    }
                    .buttonStyle(.bordered)
                }
                .disabled(isLoading)
                
                Spacer()
                
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
                .disabled(isLoading)
            }
            .padding()
            .navigationTitle("EVM Wallet")
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
                        try await paraEvmSigner.selectWallet(walletId: selectedWallet.id)
                    } catch {
                        result = ("Error", "Failed to select wallet: \(error.localizedDescription)")
                    }
                    isLoading = false
                }
            }
            
            // Loading overlay
            if isLoading {
                Color.black.opacity(0.2)
                    .edgesIgnoringSafeArea(.all)
                    .overlay(
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                            .scaleEffect(1.5)
                    )
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
    let mockWallet = Wallet(
        id: "preview-wallet-id",
        signer: "mock-signer",
        address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
        publicKey: "mock-public-key"
    )
    
    NavigationStack {
        EVMWalletView(selectedWallet: mockWallet)
            .environmentObject(mockParaManager)
            .environmentObject(try! ParaEvmSigner(
                paraManager: mockParaManager,
                rpcUrl: "https://sepolia.infura.io/v3/961364684c7346c080994baab1469ea8",
                walletId: mockWallet.id
            ))
            .environmentObject(AppRootManager())
    }
}
