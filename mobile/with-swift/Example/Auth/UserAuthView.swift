import SwiftUI
import ParaSwift

enum NavigationDestination {
    case verifyEmail, wallet
}

struct UserAuthView: View {
    @EnvironmentObject var paraManager: ParaManager
    
    var body: some View {
        NavigationStack {
            List {
                NavigationLink {
                    EmailAuthView()
                } label: {
                    AuthTypeView(
                        image: Image(systemName: "envelope"),
                        title: "Email + Passkey",
                        description: "Use your email to create or sign in with a passkey."
                    )
                }
                
                NavigationLink {
                    PhoneAuthView()
                } label: {
                    AuthTypeView(
                        image: Image(systemName: "phone"),
                        title: "Phone + Passkey",
                        description: "Use your phone number to create or sign in with a passkey."
                    )
                }
                
                NavigationLink(destination: OAuthView()) {
                    AuthTypeView(
                        image: Image(systemName: "xmark.triangle.circle.square"),
                        title: "OAuth + Passkey",
                        description: "Use different OAuth providers to create or sign in with a passkey"
                    )
                }
                
                NavigationLink {
                    ExternalWalletAuthView()
                } label: {
                    AuthTypeView(
                        image: Image(systemName: "wallet.pass"),
                        title: "External Wallet",
                        description: "Login as an external wallet."
                    )
                }
                
                
            }
            .navigationTitle("Authentication")
            .listStyle(.insetGrouped)
        }
    }
}

struct AuthTypeView: View {
    let image: Image
    let title: String
    let description: String
    
    var body: some View {
        VStack (alignment: .leading) {
            HStack {
                image.font(.title).foregroundStyle(.red).padding(.trailing)
                Text(title).font(.title)
            }
            Text(description)
        }
    }
}

#Preview {
    UserAuthView()
        .environmentObject(ParaManager(environment: .sandbox, apiKey: "preview-key"))
}
