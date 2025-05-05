import SwiftUI
import ParaSwift
import AuthenticationServices

struct ChooseSignupMethodView: View {
    @EnvironmentObject var paraManager: ParaManager
    @EnvironmentObject var appRootManager: AppRootManager
    
    let authState: AuthState // Received from verification
    
    @State private var isLoading = false
    @State private var errorMessage: String?
    
    @Environment(\.authorizationController) private var authorizationController
    @Environment(\.webAuthenticationSession) private var webAuthenticationSession
    
    var body: some View {
        VStack(spacing: 20) {
            // Success icon
            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 60))
                .foregroundColor(.green)
                .padding(.bottom, 10)
            
            Text("Account Verified!")
                .font(.title2)
                .fontWeight(.bold)
            
            Text("Choose how to secure your account")
                .foregroundColor(.secondary)
            
            // Error message if needed
            if let errorMessage = errorMessage {
                Text(errorMessage)
                    .foregroundColor(.red)
                    .padding()
                    .background(Color.red.opacity(0.1))
                    .cornerRadius(8)
                    .padding(.horizontal)
                    .accessibilityIdentifier("errorMessage")
            }
            
            // Progress indicator during setup
            if isLoading {
                ProgressView()
                    .padding()
            }
            
            Spacer()
                .frame(height: 20)
            
            // Security method options
            VStack(spacing: 16) {
                // Passkey option
                securityOptionButton(
                    icon: "faceid",
                    title: "Use Face ID / Touch ID",
                    description: "Quick and secure biometric login",
                    isDisabled: !paraManager.isSignupMethodAvailable(method: .passkey, authState: authState),
                    action: { setupAccount(method: .passkey) }
                )
                .accessibilityIdentifier("passkeyButton")
                
                // Password option
                securityOptionButton(
                    icon: "key.fill",
                    title: "Use Password",
                    description: "Traditional password-based login",
                    isDisabled: !paraManager.isSignupMethodAvailable(method: .password, authState: authState),
                    action: { setupAccount(method: .password) }
                )
                .accessibilityIdentifier("passwordButton")
            }
            .padding(.horizontal)
            
            Spacer()
        }
        .padding()
        .navigationTitle("Secure Your Account")
        .navigationBarBackButtonHidden(isLoading)
    }
    
    private func securityOptionButton(
        icon: String,
        title: String,
        description: String,
        isDisabled: Bool,
        action: @escaping () -> Void
    ) -> some View {
        Button(action: action) {
            HStack {
                Image(systemName: icon)
                    .font(.title2)
                    .frame(width: 30)
                
                VStack(alignment: .leading, spacing: 4) {
                    Text(title)
                        .font(.headline)
                    
                    Text(description)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            .padding()
            .frame(maxWidth: .infinity)
            .background(Color(.systemGray6))
            .cornerRadius(12)
        }
        .buttonStyle(.plain)
        .disabled(isLoading || isDisabled)
        .opacity(isDisabled ? 0.5 : 1.0)
    }
    
    // Handle account setup with specified method
    private func setupAccount(method: ParaManager.SignupMethod) {
        isLoading = true
        errorMessage = nil
        
        Task {
            do {
                // Set up the account with Para SDK using the chosen method
                try await paraManager.handleSignup(
                    authState: authState,
                    method: method,
                    authorizationController: authorizationController,
                    webAuthenticationSession: webAuthenticationSession
                )
                
                // Navigate to home screen on success
                appRootManager.currentRoot = .home
            } catch {
                // Handle any errors
                errorMessage = "Setup failed: \(error.localizedDescription)"
                isLoading = false
            }
        }
    }
}

#Preview {
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
