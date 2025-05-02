import SwiftUI
import ParaSwift
import AuthenticationServices

struct ChooseSignupMethodView: View {
    @EnvironmentObject var paraManager: ParaManager
    @EnvironmentObject var appRootManager: AppRootManager
    
    let authState: AuthState // Received from VerifyEmailView
    
    @State private var isLoading = false
    @State private var errorMessage: String?
    
    @Environment(\.authorizationController) private var authorizationController
    @Environment(\.webAuthenticationSession) private var webAuthenticationSession
    
    var body: some View {
        VStack(spacing: 30) {
            Text("Verification successful!")
                .font(.title2)
            
            Text("Choose how you want to secure your new account:")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
            
            if let errorMessage = errorMessage {
                Text(errorMessage)
                    .foregroundColor(.red)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)
                    .accessibilityIdentifier("errorMessage")
                    .lineLimit(4, reservesSpace: true)
            }
            
            if isLoading {
                ProgressView("Setting up account...")
            }
            
            // MARK: - Passkey Button
            Button {
                setupAccount(method: .passkey)
            } label: {
                VStack {
                    Image(systemName: "person.badge.key.fill")
                        .font(.title)
                    Text("Secure with Passkey")
                        .fontWeight(.semibold)
                    Text("Recommended. Uses Face ID / Touch ID.")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                .frame(maxWidth: .infinity)
            }
            .buttonStyle(.bordered)
            .disabled(isLoading || authState.passkeyId == nil)
            .accessibilityIdentifier("passkeyButton")
            
            // MARK: - Password Button
            Button {
                setupAccount(method: .password)
            } label: {
                VStack {
                    Image(systemName: "lock.rectangle.stack.fill")
                        .font(.title)
                    Text("Secure with Password")
                        .fontWeight(.semibold)
                    Text("Uses a traditional password.")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                .frame(maxWidth: .infinity)
            }
            .buttonStyle(.bordered)
            .disabled(isLoading || authState.passwordUrl == nil)
            .accessibilityIdentifier("passwordButton")
            
            Spacer()
        }
        .padding()
        .navigationTitle("Secure Your Account")
        .navigationBarBackButtonHidden(isLoading)
    }
    
    // MARK: - Account Setup Logic
    
    private func setupAccount(method: ParaManager.SignupMethod) {
        isLoading = true
        errorMessage = nil
        
        Task {
            do {
                try await paraManager.handleSignupMethod(
                    authState: authState,
                    method: method,
                    authorizationController: authorizationController,
                    webAuthenticationSession: webAuthenticationSession
                )
                
                // If we reach here, signup was successful and wallet was created
                appRootManager.currentRoot = .home
                
            } catch {
                errorMessage = "Account setup failed: \(error.localizedDescription)"
                isLoading = false
            }
        }
    }
}

// MARK: - Preview

#Preview {
    // Create a sample AuthState for previewing
    let sampleAuthState = AuthState(
        stage: .signup,
        userId: "preview-user-id",
        authIdentity: EmailIdentity(email: "test@example.com"),
        passkeyUrl: "https://example.com/passkey",
        passkeyId: "preview-passkey-id",
        passwordUrl: "https://example.com/password"
    )
    
    return NavigationStack {
        ChooseSignupMethodView(authState: sampleAuthState)
            .environmentObject(ParaManager(environment: .sandbox, apiKey: "preview-key"))
            .environmentObject(AppRootManager())
    }
}
