import ParaSwift
import SwiftUI

struct AuthOptionsView: View {
    @EnvironmentObject var paraManager: ParaManager

    var body: some View {
        NavigationStack {
            List {
                // External wallet option
                NavigationLink(destination: ExternalWalletAuthView()) {
                    HStack {
                        Image(systemName: "wallet.pass")
                            .font(.title2)
                            .foregroundColor(.orange)
                            .frame(width: 35)

                        VStack(alignment: .leading) {
                            Text("External Wallet")
                                .font(.headline)
                            Text("Connect with crypto wallet")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                        }
                    }
                    .padding(.vertical, 4)
                }
                .accessibilityIdentifier("externalWalletButton")
            }
            .navigationTitle("Authentication")
            .listStyle(.insetGrouped)
        }
        .accessibilityIdentifier("authenticationView")
    }
}

#Preview {
    AuthOptionsView()
        .environmentObject(ParaManager(environment: .sandbox, apiKey: "preview-key"))
}
