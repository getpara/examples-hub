import ParaSwift
import SwiftUI

struct StellarWalletView: View {
    @EnvironmentObject var paraManager: ParaManager

    let selectedWallet: ParaSwift.Wallet

    @State private var messageToSign = ""
    @State private var result: (title: String, message: String)?
    @State private var isSigningMessage = false
    @State private var isSigningTransaction = false

    private var displayAddress: String {
        selectedWallet.stellarAddress ?? selectedWallet.address ?? "No wallet found"
    }

    private func signMessage() {
        guard !messageToSign.isEmpty else {
            result = ("Error", "Please enter a message to sign.")
            return
        }

        isSigningMessage = true
        Task {
            do {
                let signature = try await paraManager.signMessage(
                    walletId: selectedWallet.id,
                    message: messageToSign
                )
                result = ("Message Signed", "Message: \(messageToSign)\n\nSignature:\n\(signature.signedTransaction)")
            } catch {
                result = ("Error", "Failed to sign message: \(error.localizedDescription)")
            }
            isSigningMessage = false
        }
    }

    private func signTransaction() {
        guard displayAddress != "No wallet found" else {
            result = ("Error", "No Stellar address available.")
            return
        }

        isSigningTransaction = true
        Task {
            do {
                let transaction = StellarTransaction(
                    to: displayAddress,
                    amount: "1",
                    memo: .text("Para Swift"),
                    networkPassphrase: StellarNetwork.testnetPassphrase,
                    fee: "100",
                    timeout: 30,
                    sequenceNumber: "0"
                )
                let signature = try await paraManager.signTransaction(
                    walletId: selectedWallet.id,
                    transaction: transaction
                )
                result = ("Transaction Signed", "Network: Stellar testnet\nAmount: 1 XLM\n\nSigned XDR:\n\(signature.transactionData)")
            } catch {
                result = ("Error", "Failed to sign transaction: \(error.localizedDescription)")
            }
            isSigningTransaction = false
        }
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                VStack(spacing: 12) {
                    Text("Wallet Address")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .frame(maxWidth: .infinity, alignment: .leading)

                    HStack {
                        Text(displayAddress)
                            .font(.system(.footnote, design: .monospaced))
                            .lineLimit(1)
                            .truncationMode(.middle)
                            .accessibilityIdentifier("stellarAddressText")

                        Spacer()

                        Button {
                            UIPasteboard.general.string = displayAddress
                            result = ("Success", "Address copied to clipboard")
                        } label: {
                            Image(systemName: "doc.on.doc")
                                .font(.footnote)
                        }
                        .buttonStyle(.borderless)
                        .accessibilityIdentifier("copyAddressButton")
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(10)
                }
                .padding()
                .background(Color(.systemBackground))
                .cornerRadius(16)
                .shadow(color: Color.black.opacity(0.05), radius: 5, x: 0, y: 2)

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
                        signMessage()
                    }
                    .buttonStyle(.borderedProminent)
                    .disabled(isSigningMessage || messageToSign.isEmpty)
                    .frame(maxWidth: .infinity)
                    .overlay {
                        if isSigningMessage {
                            ProgressView()
                        }
                    }
                }
                .padding()
                .background(Color(.systemBackground))
                .cornerRadius(16)
                .shadow(color: Color.black.opacity(0.05), radius: 5, x: 0, y: 2)

                VStack(spacing: 16) {
                    Text("Transaction Operations")
                        .font(.headline)
                        .frame(maxWidth: .infinity, alignment: .leading)

                    Button("Sign Transaction") {
                        signTransaction()
                    }
                    .buttonStyle(.bordered)
                    .disabled(isSigningTransaction)
                    .frame(maxWidth: .infinity)

                    Text("Signs a testnet XLM payment payload and returns signed Stellar XDR.")
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
        .navigationTitle("Stellar Wallet")
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
    }
}

#Preview {
    let mockParaManager = ParaManager(environment: .sandbox, apiKey: "preview-key")
    let mockWallet = ParaSwift.Wallet(result: [
        "id": "preview-wallet-id",
        "type": "STELLAR",
        "address": "FhBpLCxutevuuZ8bnQMLSvQ6Z9tLXr6vZP5DLSbbDpGq",
        "publicKey": "da4f143ecf1e3e0d6780c0965cb950aee498e51aa29af0acfc2e23e359a3e232",
    ])

    NavigationStack {
        StellarWalletView(selectedWallet: mockWallet)
            .environmentObject(mockParaManager)
    }
}
