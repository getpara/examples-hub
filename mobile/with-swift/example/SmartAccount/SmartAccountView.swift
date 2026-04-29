import ParaSwift
import SwiftUI

/// Demonstrates the Account Abstraction flow: provision an Alchemy smart account
/// for the active Para EOA, then send a gasless zero-value transaction on Sepolia.
///
/// Mirrors the Expo reference implementation at
/// `examples-hub/mobile/with-expo-one-click-login/app/(tabs)/smart-account.tsx`.
struct SmartAccountView: View {
    @EnvironmentObject var paraManager: ParaManager

    let eoaWallet: Wallet

    @State private var smartAccount: SmartAccountInfo?
    @State private var isInitializing = true
    @State private var initError: String?

    @State private var isSending = false
    @State private var sendError: String?
    @State private var lastReceipt: AATransactionReceipt?

    @State private var copiedField: CopyField?

    private enum CopyField {
        case eoa, smart
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                connectedWalletsCard
                sponsoredTxCard
                explainerCard
            }
            .padding(.horizontal)
            .padding(.vertical, 16)
        }
        .navigationTitle("Smart Account")
        .navigationBarTitleDisplayMode(.inline)
        .task { await initializeSmartAccount() }
    }

    // MARK: - Cards

    private var connectedWalletsCard: some View {
        CardContainer {
            Text("Connected Wallets")
                .font(.headline)

            addressRow(
                label: "EOA (Para Wallet)",
                address: eoaWallet.address ?? "",
                field: .eoa
            )

            smartAccountRow
        }
    }

    @ViewBuilder
    private var smartAccountRow: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Smart Account (Alchemy Modular Account)")
                .font(.caption)
                .foregroundStyle(.secondary)

            if isInitializing {
                HStack(spacing: 8) {
                    ProgressView().controlSize(.small)
                    Text("Initializing smart account…")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                }
            } else if let initError {
                Text(initError)
                    .font(.footnote)
                    .foregroundStyle(.red)
            } else if let address = smartAccount?.smartAccountAddress {
                copyableAddress(address, field: .smart)
            } else {
                Text("Not available")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }
        }
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(.systemGray6))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    private func addressRow(label: String, address: String, field: CopyField) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(label)
                .font(.caption)
                .foregroundStyle(.secondary)
            copyableAddress(address, field: field)
        }
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(.systemGray6))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    private func copyableAddress(_ address: String, field: CopyField) -> some View {
        HStack {
            Text(truncate(address))
                .font(.system(.footnote, design: .monospaced))
                .lineLimit(1)
            Spacer()
            Button {
                UIPasteboard.general.string = address
                copiedField = field
                DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                    if copiedField == field { copiedField = nil }
                }
            } label: {
                Image(systemName: copiedField == field ? "checkmark" : "doc.on.doc")
                    .foregroundStyle(copiedField == field ? Color.green : Color.secondary)
            }
            .buttonStyle(.plain)
            .accessibilityIdentifier(field == .eoa ? "copyEoaAddressButton" : "copySmartAccountAddressButton")
        }
    }

    private var sponsoredTxCard: some View {
        CardContainer {
            Text("Send Sponsored Transaction")
                .font(.headline)

            Text("Sends a zero-value transaction to demonstrate EIP-4337 gas sponsorship via Alchemy's paymaster.")
                .font(.footnote)
                .foregroundStyle(.secondary)

            Button {
                Task { await sendSponsoredTransaction() }
            } label: {
                HStack {
                    if isSending {
                        ProgressView().controlSize(.small).tint(.white)
                    } else {
                        Image(systemName: "bolt.fill")
                    }
                    Text(isSending ? "Sending…" : "Send Gasless Transaction")
                        .fontWeight(.semibold)
                }
                .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
            .controlSize(.large)
            .disabled(smartAccount == nil || isSending)
            .accessibilityIdentifier("sendGaslessTransactionButton")

            if let sendError, !isSending {
                Text(sendError)
                    .font(.footnote)
                    .foregroundStyle(.red)
                    .padding(12)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color.red.opacity(0.1))
                    .clipShape(RoundedRectangle(cornerRadius: 12))
            }

            if let hash = lastReceipt?.transactionHash, !isSending {
                successBanner(hash: hash)
            }
        }
    }

    private func successBanner(hash: String) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Transaction sent successfully!")
                .font(.footnote)
                .fontWeight(.semibold)
                .foregroundStyle(Color.green)

            Text(hash)
                .font(.system(.caption2, design: .monospaced))
                .textSelection(.enabled)

            Button {
                if let url = URL(string: "\(AlchemyConfig.explorerBaseURL)/tx/\(hash)") {
                    UIApplication.shared.open(url)
                }
            } label: {
                Label("View on Etherscan", systemImage: "arrow.up.right.square")
                    .font(.footnote)
            }
            .buttonStyle(.bordered)
            .controlSize(.small)
            .accessibilityIdentifier("viewOnEtherscanButton")
        }
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.green.opacity(0.1))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    private var explainerCard: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("What is Account Abstraction?")
                .font(.footnote)
                .fontWeight(.semibold)
                .foregroundStyle(Color.indigo)

            Text("Account Abstraction (EIP-4337) lets you use smart contract wallets that support gas sponsorship, batched transactions, and custom validation. Your Para wallet acts as the signer, while the smart account handles on-chain execution.")
                .font(.caption)
                .foregroundStyle(Color.indigo.opacity(0.85))
        }
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.indigo.opacity(0.08))
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    // MARK: - Actions

    private func initializeSmartAccount() async {
        guard smartAccount == nil else { return }
        isInitializing = true
        initError = nil
        do {
            let info = try await paraManager.createSmartAccount(
                apiKey: AlchemyConfig.apiKey,
                chainId: AlchemyConfig.chainId,
                gasPolicyId: AlchemyConfig.gasPolicyId,
                mode: "4337",
                walletId: eoaWallet.id
            )
            smartAccount = info
        } catch {
            initError = error.localizedDescription
        }
        isInitializing = false
    }

    private func sendSponsoredTransaction() async {
        guard let smartAccount else { return }
        isSending = true
        sendError = nil
        lastReceipt = nil
        do {
            let receipt = try await paraManager.sendSmartAccountTransaction(
                smartAccountAddress: smartAccount.smartAccountAddress,
                chainId: AlchemyConfig.chainId,
                to: AlchemyConfig.burnAddress
            )
            lastReceipt = receipt
        } catch {
            sendError = error.localizedDescription
        }
        isSending = false
    }

    // MARK: - Helpers

    private func truncate(_ address: String) -> String {
        guard address.count > 14 else { return address }
        return "\(address.prefix(8))…\(address.suffix(6))"
    }
}

/// Lightweight card wrapper used by `SmartAccountView`.
private struct CardContainer<Content: View>: View {
    @ViewBuilder let content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            content
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .shadow(color: .black.opacity(0.05), radius: 5, x: 0, y: 2)
    }
}

#Preview {
    let mock = ParaManager(environment: .sandbox, apiKey: "preview-key")
    let wallet = Wallet(
        id: "preview",
        signer: "s",
        address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
        publicKey: "pk"
    )
    return NavigationStack {
        SmartAccountView(eoaWallet: wallet)
            .environmentObject(mock)
    }
}
