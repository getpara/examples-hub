import SwiftUI
import ParaSwift
import AuthenticationServices

struct ChooseSignupMethodView: View {
    @EnvironmentObject var paraManager: ParaManager
    @EnvironmentObject var appRootManager: AppRootManager
    
    let authState: AuthState // Received from VerifyEmailView/VerifyPhoneView
    
    @State private var isLoading = false
    @State private var errorMessage: String?
    
    @Environment(\.authorizationController) private var authorizationController
    @Environment(\.webAuthenticationSession) private var webAuthenticationSession
    
    // Helper to get the primary identifier (email/phone)
    private var identifier: String {
        switch authState.authIdentity {
        case let emailIdentity as EmailIdentity:
            return emailIdentity.email
        case let phoneIdentity as PhoneIdentity:
            return paraManager.formatPhoneNumber(phoneNumber: phoneIdentity.phone, countryCode: phoneIdentity.countryCode)
        default:
            return authState.userId
        }
    }
    
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
                    .lineLimit(4, reservesSpace: true) // Reserve space to prevent layout shifts
            }
            
            if isLoading {
                ProgressView("Setting up account...")
            }
            
            // MARK: - Passkey Button
            Button {
                guard let passkeyId = authState.passkeyId else {
                    errorMessage = "Passkey information missing from verification step."
                    return
                }
                setupAccount(method: .passkey(passkeyId: passkeyId))
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
            .disabled(isLoading || authState.passkeyId == nil) // Disable if passkey setup isn't possible
            .accessibilityIdentifier("passkeyButton")
            
            // MARK: - Password Button
            Button {
                guard let passwordUrl = authState.passwordUrl else {
                    errorMessage = "Password setup information missing from verification step."
                    return
                }
                setupAccount(method: .password(url: passwordUrl))
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
            .disabled(isLoading || authState.passwordUrl == nil) // Disable if password setup isn't possible
            .accessibilityIdentifier("passwordButton")
            
            Spacer()
        }
        .padding()
        .navigationTitle("Secure Your Account")
        .navigationBarBackButtonHidden(isLoading) // Prevent back navigation during critical setup
    }
    
    // MARK: - Account Setup Logic
    
    private enum SetupMethod {
        case passkey(passkeyId: String)
        case password(url: String)
    }
    
    private func setupAccount(method: SetupMethod) {
        isLoading = true
        errorMessage = nil
        
        Task {
            do {
                switch method {
                case .passkey(let passkeyId):
                    // 1. Generate Passkey
                    try await paraManager.generatePasskey(
                        identifier: self.identifier, // Use helper to get email/phone
                        biometricsId: passkeyId,
                        authorizationController: authorizationController
                    )
                    
                    // 2. Create Wallet (implicit after passkey generation for now)
                    //    Assuming generatePasskey triggers necessary backend setup
                    
                case .password(let url):
                    // 1. Present Password URL
                    guard let _ = try await paraManager.presentPasswordUrl(
                        url,
                        webAuthenticationSession: webAuthenticationSession,
                        isSignup: true // Important: This is a signup flow
                    ) else {
                        throw ParaError.error("Password setup flow did not complete successfully.")
                    }
                    // Polling and session update happens within presentPasswordUrl
                }
                
                // 3. Explicitly Create Wallet *after* successful setup (Passkey or Password)
                //    This ensures the SDK state reflects the new wallet correctly.
                _ = try await paraManager.createWallet(type: .evm, skipDistributable: false)
                
                // 4. Navigate Home
                appRootManager.currentRoot = .home
                
            } catch let error as ParaError {
                errorMessage = error.description
                isLoading = false
            } catch {
                errorMessage = "An unexpected error occurred during account setup: \(error.localizedDescription)"
                isLoading = false
            }
            // isLoading is implicitly false on success due to navigation
        }
    }
}

// MARK: - Preview

#Preview {
    // Create a sample AuthState for previewing
    let sampleAuthState = AuthState(
        stage: .signup,
        userId: "preview-user-id",
        authIdentity: EmailIdentity(email: "test@example.com"), // Example email identity
        passkeyUrl: "https://example.com/passkey", // Dummy URL
        passkeyId: "preview-passkey-id",           // Dummy ID
        passwordUrl: "https://example.com/password" // Dummy URL
    )
    
    return NavigationStack {
        ChooseSignupMethodView(authState: sampleAuthState)
            .environmentObject(ParaManager(environment: .sandbox, apiKey: "preview-key"))
            .environmentObject(AppRootManager())
    }
} 
