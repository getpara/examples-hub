import ParaSwift
import SwiftUI

struct SigningExamplesView: View {
    @EnvironmentObject private var paraManager: ParaManager

    let wallet: Wallet

    private var catalog: Result<[SigningExampleAction], Error> {
        Result { try buildSigningExampleCatalog(manager: paraManager, wallet: wallet) }
    }

    var body: some View {
        switch catalog {
        case let .success(actions):
            List {
                Section {
                    Text(
                        "These examples sign only. They never broadcast. Use the returned signed payload with your chain client after validation."
                    )
                    .accessibilityIdentifier("signingExamplesNotice")
                }

                signingSection(
                    title: "Messages",
                    actions: actions.filter { $0.definition.operation == .message }
                )
                signingSection(
                    title: "Transactions",
                    actions: actions.filter { $0.definition.operation == .transaction }
                )
            }
            .accessibilityIdentifier("signingExamplesScreen")
            .navigationTitle("\(wallet.chainType?.rawValue ?? "Wallet") signing")
        case let .failure(error):
            VStack(spacing: 12) {
                Image(systemName: "exclamationmark.triangle")
                    .font(.largeTitle)
                Text("Signing examples unavailable")
                    .font(.headline)
                Text(error.localizedDescription)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
            }
            .padding()
            .navigationTitle("\(wallet.chainType?.rawValue ?? "Wallet") signing")
        }
    }

    private func signingSection(title: String, actions: [SigningExampleAction]) -> some View {
        Section(title) {
            ForEach(actions) { action in
                SigningExampleRow(action: action)
            }
        }
    }
}

struct SigningExamplesToolbarLink: View {
    let wallet: Wallet

    var body: some View {
        NavigationLink {
            SigningExamplesView(wallet: wallet)
        } label: {
            Image(systemName: "pencil.and.scribble")
        }
        .accessibilityLabel("Signing examples")
        .accessibilityIdentifier("openSigningExamplesButton")
    }
}

private struct SigningExampleRow: View {
    let action: SigningExampleAction

    @State private var input: String
    @State private var isSigning = false
    @State private var result: SigningAlert?

    init(action: SigningExampleAction) {
        self.action = action
        _input = State(initialValue: action.initialInput)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(action.definition.title)
                .font(.headline)
            Text(action.definition.description)
                .font(.subheadline)
                .foregroundStyle(.secondary)

            if action.requiresInput {
                TextField(action.inputLabel, text: $input, axis: .vertical)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
                    .lineLimit(2 ... 4)
                    .textFieldStyle(.roundedBorder)
                    .accessibilityIdentifier("\(action.id)-input")
            }

            Button {
                sign()
            } label: {
                HStack {
                    if isSigning {
                        ProgressView()
                    }
                    Text("Sign \(action.definition.title)")
                }
                .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
            .disabled(isSigning)
            .accessibilityIdentifier(action.id)
        }
        .padding(.vertical, 6)
        .alert(item: $result) { result in
            Alert(
                title: Text(result.title),
                message: Text(result.message),
                dismissButton: .default(Text("Done"))
            )
        }
    }

    private func sign() {
        isSigning = true
        Task {
            do {
                let signed = try await action.sign(input: input)
                await MainActor.run {
                    result = SigningAlert(title: "Signed", message: signed)
                    isSigning = false
                }
            } catch {
                await MainActor.run {
                    result = SigningAlert(title: "Signing failed", message: error.localizedDescription)
                    isSigning = false
                }
            }
        }
    }
}

private struct SigningAlert: Identifiable {
    let id = UUID()
    let title: String
    let message: String
}
