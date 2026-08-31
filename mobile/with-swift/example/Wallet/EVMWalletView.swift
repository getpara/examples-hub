import BigInt
import ParaSwift
import SwiftUI
import Web3Core
import web3swift

struct EVMWalletView: View {
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
    @State private var usdcBalance: String?

    // Removed ParaEvmSigner - now using unified API

    private let web3: Web3

    // Sepolia RPC URL (testnet for testing)
    private let rpcUrl = "https://sepolia.infura.io/v3/961364684c7346c080994baab1469ea8"

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

    init(selectedWallet: ParaSwift.Wallet) {
        self.selectedWallet = selectedWallet
        // Initialize web3 with error handling in the view
        if let url = URL(string: "https://sepolia.infura.io/v3/961364684c7346c080994baab1469ea8") {
            web3 = Web3(provider: Web3HttpProvider(url: url, network: .Custom(networkID: 11_155_111)))
        } else {
            // Provide a meaningful error if URL is invalid
            web3 = Web3(provider: Web3HttpProvider(url: URL(string: "http://localhost:8545")!, network: .Custom(networkID: 11_155_111)))
        }
    }

    private func fetchBalance() {
        Task {
            do {
                // Fetch ETH balance using Para SDK
                // Need to specify Sepolia RPC URL for correct network
                let ethBalanceResult = try await paraManager.getBalance(
                    walletId: selectedWallet.id,
                    rpcUrl: rpcUrl  // Sepolia RPC URL
                )
                // Debug: Log the raw balance
                print("Raw ETH balance from Para: \(ethBalanceResult)")
                
                // Para returns balance as a string in wei
                if let ethBalance = Double(ethBalanceResult) {
                    let ethValue = ethBalance / 1e18
                    self.balance = String(format: "%.4f ETH", ethValue)
                    print("Converted ETH balance: \(self.balance ?? "nil")")
                } else {
                    print("Failed to convert ETH balance to Double")
                    self.balance = "0.0000 ETH"
                }
                
                // Fetch USDC balance using Para SDK
                // USDC on Sepolia: 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
                let usdcBalanceResult = try await paraManager.getBalance(
                    walletId: selectedWallet.id,
                    token: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
                    rpcUrl: rpcUrl  // Sepolia RPC URL
                )
                
                // Debug: Log the raw USDC balance
                print("Raw USDC balance from Para: \(usdcBalanceResult)")
                
                // Check if USDC balance is the same as ETH balance (indicates a bug)
                if usdcBalanceResult == ethBalanceResult {
                    print("Warning: USDC balance same as ETH balance - token query might not be working")
                    // For now, just show 0 USDC since we can't get the real balance
                    self.usdcBalance = "0.00 USDC"
                } else if let usdcBalance = Double(usdcBalanceResult) {
                    // USDC has 6 decimals
                    let usdcValue = usdcBalance / 1e6
                    self.usdcBalance = String(format: "%.2f USDC", usdcValue)
                    print("Converted USDC balance: \(self.usdcBalance ?? "nil")")
                } else {
                    print("Failed to convert USDC balance to Double")
                    self.usdcBalance = "0.00 USDC"
                }
            } catch {
                result = ("Error", "Failed to fetch balance: \(error.localizedDescription)")
            }
        }
    }

    private func signTransaction() {
        guard let transaction = createTransaction(value: "1000000000") else { return }

        isLoading = true
        Task {
            var signature: SignatureResult?
            let (duration, error) = await measureTime {
                // Pass the transaction object directly - bridge will format it
                signature = try await paraManager.signTransaction(
                    walletId: selectedWallet.id,
                    transaction: transaction,
                    chainId: "11155111" // Sepolia chain ID
                )
            }

            if let error {
                result = ("Error", "Failed to sign transaction: \(error.localizedDescription)\nDuration: \(String(format: "%.2f", duration))s")
            } else if let sig = signature {
                // Use transactionData which prefers signedTransaction for EVM (complete RLP-encoded tx)
                // This is what you'd broadcast with eth_sendRawTransaction
                let txData = sig.transactionData
                result = ("Transaction Signed", "Type: EIP-1559\nTo: 0x301d75d850c878b160ad9e1e3f6300202de9e97f\nValue: 1 gwei\nGas: 21000\nMax Fee: 3 gwei\nChain: Sepolia (11155111)\n\nSigned Transaction:\n\(txData)\n\nDuration: \(String(format: "%.3f", duration))s")
            }
            isLoading = false
        }
    }

    private func sendTransaction() {
        // Validate the sample transaction parameters before attempting the transfer call
        guard createTransaction(value: "100000000000000") != nil else { return }

        // Check if we have balance info and sufficient funds
        if let balanceString = balance {
            // Extract numeric value from balance string (e.g., "0.0001 ETH" -> 0.0001)
            let balanceValue = balanceString.replacingOccurrences(of: " ETH", with: "")
            if let balanceDouble = Double(balanceValue) {
                let transactionETH = 0.0001 // Amount being sent
                let estimatedGas = 0.00006 // Estimated gas fee (~21000 gas * 3 gwei)
                let requiredETH = transactionETH + estimatedGas

                if balanceDouble < requiredETH {
                    result = ("Insufficient Balance",
                              "You need at least \(String(format: "%.6f", requiredETH)) ETH to send this transaction.\n\n" +
                                  "Current balance: \(balanceString)\n" +
                                  "Transaction amount: \(String(format: "%.4f", transactionETH)) ETH\n" +
                                  "Estimated gas fee: \(String(format: "%.6f", estimatedGas)) ETH\n\n" +
                                  "To fund your wallet on Sepolia:\n" +
                                  "1. Copy your wallet address\n" +
                                  "2. Visit a Sepolia faucet\n" +
                                  "3. Request test ETH")
                    return
                }
            }
        }

        isLoading = true
        Task {
            var transferResult: TransferResult?
            let (duration, error) = await measureTime {
                // Using the high-level transfer method that handles everything
                transferResult = try await paraManager.transfer(
                    walletId: selectedWallet.id,
                    to: "0x301d75d850c878b160ad9e1e3f6300202de9e97f",
                    amount: "100000000000000", // Wei amount
                    chainId: "11155111", // Sepolia chain ID
                    rpcUrl: rpcUrl // Use the defined Sepolia RPC URL
                )
                // Log the transaction hash
                if let hash = transferResult?.hash {
                    print("Transaction sent: \(hash)")
                }
            }

            if let error {
                let errorMessage = error.localizedDescription
                if errorMessage.contains("insufficient") || errorMessage.contains("balance") || errorMessage.contains("funds") {
                    result = ("Insufficient Balance",
                              "Transaction failed due to insufficient balance.\n\n" +
                                  "To fund your wallet on Sepolia:\n" +
                                  "1. Copy your wallet address\n" +
                                  "2. Visit https://sepoliafaucet.com\n" +
                                  "3. Paste your address and request ETH\n\n" +
                                  "Other faucets:\n" +
                                  "• https://www.alchemy.com/faucets/ethereum-sepolia\n" +
                                  "• https://faucets.chain.link/sepolia\n\n" +
                                  "Duration: \(String(format: "%.2f", duration))s")
                } else {
                    result = ("Error", "Failed to send transaction: \(errorMessage)\nDuration: \(String(format: "%.2f", duration))s")
                }
            } else if let txResult = transferResult {
                let etherscanUrl = "https://sepolia.etherscan.io/tx/\(txResult.hash)"
                
                result = ("Transaction Broadcast", "Hash: \(txResult.hash)\nTo: \(txResult.to)\nValue: 0.0001 ETH\nGas Used: ~21000\nStatus: Pending\n\nView on Etherscan:\n\(etherscanUrl)\n\nDuration: \(String(format: "%.3f", duration))s")
                // Refresh balance after successful transaction
                fetchBalance()
            }
            isLoading = false
        }
    }

    private func createTransaction(value: String) -> EVMTransaction? {
        func createBigUInt(_ string: String) -> BigUInt? {
            BigUInt(string)
        }

        guard let value = createBigUInt(value),
              let gasLimit = createBigUInt("21000"),
              let maxPriorityFeePerGas = createBigUInt("1000000000"),
              let maxFeePerGas = createBigUInt("3000000000"),
              let nonce = createBigUInt("3"),
              let chainId = createBigUInt("11155111")
        else {
            result = ("Error", "Invalid numeric parameters for transaction")
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
            smartContractAbi: nil,
            smartContractFunctionName: nil,
            smartContractFunctionArgs: nil,
            smartContractByteCode: nil,
            type: 2
        )
    }

    private func testERC20Transfer() {
        isLoading = true
        Task {
            var signature: SignatureResult?
            let (duration, error) = await measureTime {
                // USDC on Sepolia testnet
                let testTokenAddress = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"
                let recipientAddress = "0xcb53FD7529d257D40618992993c5F863f5d86572"
                let transferAmount = "100000" // 0.1 USDC (6 decimals)
                
                // ERC20 ABI for transfer function
                let erc20Abi = """
                [{
                    "inputs": [
                        {"name": "recipient", "type": "address"},
                        {"name": "amount", "type": "uint256"}
                    ],
                    "name": "transfer",
                    "outputs": [{"name": "", "type": "bool"}],
                    "type": "function"
                }]
                """
                
                let transaction = EVMTransaction(
                    to: testTokenAddress,
                    value: BigUInt("0"), // No ETH value for ERC20 transfer
                    gasLimit: BigUInt("100000"), // Higher gas limit for smart contract
                    gasPrice: nil,
                    maxPriorityFeePerGas: BigUInt("1500000000"), // 1.5 gwei
                    maxFeePerGas: BigUInt("3000000000"), // 3 gwei
                    nonce: BigUInt("0"),
                    chainId: BigUInt("11155111"), // Sepolia
                    smartContractAbi: erc20Abi,
                    smartContractFunctionName: "transfer",
                    smartContractFunctionArgs: [recipientAddress, transferAmount],
                    smartContractByteCode: nil,
                    type: 2 // EIP-1559
                )
                
                // Sign the ERC20 transfer transaction
                signature = try await paraManager.signTransaction(
                    walletId: selectedWallet.id,
                    transaction: transaction,
                    chainId: "11155111" // Sepolia chain ID
                )
            }
            
            if let error {
                result = ("Error", "Failed to sign ERC20 transfer: \(error.localizedDescription)\nDuration: \(String(format: "%.2f", duration))s")
            } else if let sig = signature {
                let hasSignedTx = !sig.signedTransaction.isEmpty
                let signedTxInfo = hasSignedTx
                    ? "✅ Signed transaction with encoded function call"
                    : "⚠️ Only signature available"
                
                result = ("ERC20 Transfer Signed",
                          "Token: USDC (Sepolia)\n" +
                          "Contract: 0x1c7D4B...379C7238\n" +
                          "To: 0xcb53FD...5d86572\n" +
                          "Amount: 0.1 USDC\n" +
                          "Gas Limit: 100000\n\n" +
                          "\(signedTxInfo)\n\n" +
                          "Transaction Data:\n\(String((sig.transactionData).prefix(100)))...\n\n" +
                          "Duration: \(String(format: "%.3f", duration))s\n\n" +
                          "Note: This is a test signature. To broadcast, you would need USDC tokens.")
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
                        VStack(spacing: 8) {
                            HStack {
                                Text("Balance:")
                                    .foregroundColor(.secondary)
                                Spacer()
                                Button(action: fetchBalance) {
                                    Image(systemName: "arrow.clockwise")
                                }
                                .buttonStyle(.borderless)
                                .accessibilityIdentifier("refreshBalanceButton")
                            }
                            
                            HStack {
                                Text(balanceString)
                                    .bold()
                                Spacer()
                            }
                            
                            if let usdcBalanceString = usdcBalance {
                                HStack {
                                    Text(usdcBalanceString)
                                        .bold()
                                        .foregroundColor(.blue)
                                    Spacer()
                                }
                            }
                        }
                        .padding(.vertical, 8)

                        // Show fund wallet button if balance is zero or very low
                        let balanceValue = balanceString.replacingOccurrences(of: " ETH", with: "")
                        if let balanceDouble = Double(balanceValue), balanceDouble < 0.001 {
                            Button(action: {
                                if let address = selectedWallet.address {
                                    UIPasteboard.general.string = address
                                    result = ("Wallet Address Copied",
                                              "Your address has been copied to clipboard.\n\n" +
                                                  "To fund your wallet on Sepolia testnet:\n" +
                                                  "1. Visit https://sepoliafaucet.com\n" +
                                                  "2. Paste your address: \(address)\n" +
                                                  "3. Request test ETH\n\n" +
                                                  "Alternative faucets:\n" +
                                                  "• https://www.alchemy.com/faucets/ethereum-sepolia\n" +
                                                  "• https://faucets.chain.link/sepolia\n\n" +
                                                  "Note: Sepolia ETH has no real value")
                                }
                            }) {
                                Label("Fund Wallet (Sepolia)", systemImage: "plus.circle.fill")
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

                    Button("Sign Message (EIP-191)") {
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

                    HStack(spacing: 12) {
                        Button("Send Transaction") {
                            sendTransaction()
                        }
                        .buttonStyle(.borderedProminent)
                        .frame(maxWidth: .infinity)

                        Button("Sign Transaction") {
                            signTransaction()
                        }
                        .buttonStyle(.bordered)
                        .frame(maxWidth: .infinity)
                    }
                    .disabled(isLoading)
                    
                    Button("Test ERC20 Transfer") {
                        testERC20Transfer()
                    }
                    .buttonStyle(.bordered)
                    .tint(.green)
                    .frame(maxWidth: .infinity)
                    .disabled(isLoading)
                    
                    Text("Send: Signs & broadcasts 0.0001 ETH → 0x301d...e97f\nSign: Signs only (offline), returns full signed transaction\nERC20: Test USDC transfer on Sepolia")
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .frame(maxWidth: .infinity, alignment: .leading)
                }
                .padding()
                .background(Color(.systemBackground))
                .cornerRadius(16)
                .shadow(color: Color.black.opacity(0.05), radius: 5, x: 0, y: 2)

                // Account Abstraction
                VStack(spacing: 12) {
                    Text("Account Abstraction")
                        .font(.headline)
                        .frame(maxWidth: .infinity, alignment: .leading)

                    NavigationLink {
                        SmartAccountView(eoaWallet: selectedWallet)
                            .environmentObject(paraManager)
                    } label: {
                        Label("Open Smart Account", systemImage: "sparkles")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.bordered)
                    .tint(.indigo)
                    .accessibilityIdentifier("openSmartAccountButton")

                    Text("Provision an Alchemy smart account for this EOA and send a gasless transaction on Sepolia.")
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .frame(maxWidth: .infinity, alignment: .leading)
                }
                .padding()
                .background(Color(.systemBackground))
                .cornerRadius(16)
                .shadow(color: Color.black.opacity(0.05), radius: 5, x: 0, y: 2)
            }
            .padding(.horizontal)
        }
        .navigationTitle("EVM Wallet")
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
        address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
        publicKey: "mock-public-key",
    )

    NavigationStack {
        EVMWalletView(selectedWallet: mockWallet)
            .environmentObject(mockParaManager)
            .environmentObject(AppRootManager())
    }
}
