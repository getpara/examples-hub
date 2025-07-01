import ParaSwift
import SwiftUI

struct AuthOptionsView: View {
    @EnvironmentObject var paraManager: ParaManager

    var body: some View {
        NavigationStack {
            List {
                // Email authentication option
                NavigationLink(destination: EmailAuthView()) {
                    HStack {
                        Image(systemName: "envelope")
                            .font(.title2)
                            .foregroundColor(.blue)
                            .frame(width: 35)

                        VStack(alignment: .leading) {
                            Text("Email")
                                .font(.headline)
                            Text("Sign in or register with email")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                        }
                    }
                    .padding(.vertical, 4)
                }
                .accessibilityIdentifier("emailAuthButton")

                // Phone authentication option
                NavigationLink(destination: PhoneAuthView()) {
                    HStack {
                        Image(systemName: "phone")
                            .font(.title2)
                            .foregroundColor(.green)
                            .frame(width: 35)

                        VStack(alignment: .leading) {
                            Text("Phone")
                                .font(.headline)
                            Text("Sign in or register with phone number")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                        }
                    }
                    .padding(.vertical, 4)
                }
                .accessibilityIdentifier("phoneAuthButton")

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
