import SwiftUI
import ParaSwift
import AuthenticationServices

struct EmailAuthView: View {
    @EnvironmentObject var paraManager: ParaManager
    @EnvironmentObject var appRootManager: AppRootManager
    
    @State private var email = ""
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var shouldNavigateToVerifyEmail = false
    @State private var authState: AuthState?
    
    @Environment(\.authorizationController) private var authorizationController
    @Environment(\.webAuthenticationSession) private var webAuthenticationSession
    
    var body: some View {
        VStack(spacing: 20) {
            Text("Enter your email address to create or log in.")
                .font(.subheadline)
                .foregroundColor(.secondary)
            
            TextField("Email Address", text: $email)
                .textInputAutocapitalization(.never)
                .disableAutocorrection(true)
                .textFieldStyle(.roundedBorder)
                .keyboardType(.emailAddress)
                .padding(.horizontal)
                .accessibilityIdentifier("emailInputField")
            
            if let errorMessage = errorMessage {
                Text(errorMessage)
                    .foregroundColor(.red)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)
                    .accessibilityIdentifier("errorMessage")
            }
            
            if isLoading {
                ProgressView("Processing...")
            }
            
            Button {
                // Clear any previous error message
                errorMessage = nil
                
                // Validate email first
                guard validateEmail() else {
                    return
                }
                
                isLoading = true
                Task {
                    do {
                        let state = try await paraManager.initiateAuthFlow(auth: .email(email))
                        self.authState = state
                        
                        switch state.stage {
                        case .verify:
                            // User needs to verify email
                            shouldNavigateToVerifyEmail = true
                            
                        case .login:
                            // Existing user - determine and use preferred login method
                            if let preferredMethod = paraManager.determinePreferredLoginMethod(authState: state) {
                                // Use the preferred login method based on user history
                                try await paraManager.handleLoginMethod(
                                    authState: state,
                                    method: preferredMethod,
                                    authorizationController: authorizationController,
                                    webAuthenticationSession: webAuthenticationSession
                                )
                                appRootManager.currentRoot = .home
                            } else {
                                errorMessage = "No login methods available for this account."
                            }
                            
                        case .signup:
                            // This shouldn't happen directly from email input
                            errorMessage = "Unexpected authentication state. Please try again."
                        }
                    } catch {
                        errorMessage = error.localizedDescription
                    }
                    
                    isLoading = false
                }
            } label: {
                Text("Continue")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
            .disabled(isLoading)
            .padding(.horizontal)
            .accessibilityIdentifier("continueButton")
            .navigationDestination(isPresented: $shouldNavigateToVerifyEmail) {
                if let state = authState {
                    VerifyEmailView(authState: state)
                        .environmentObject(paraManager)
                        .environmentObject(appRootManager)
                }
            }
            
            Spacer()
        }
        .padding()
        .navigationTitle("Email Authentication")
    }
    
    private func validateEmail() -> Bool {
        if email.isEmpty {
            errorMessage = "Please enter an email address."
            return false
        }
        
        // Basic email format validation
        let emailRegex = "[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,64}"
        let emailPredicate = NSPredicate(format:"SELF MATCHES %@", emailRegex)
        if !emailPredicate.evaluate(with: email) {
            errorMessage = "Please enter a valid email address."
            return false
        }
        
        return true
    }
}

#Preview {
    NavigationStack {
        EmailAuthView()
            .environmentObject(ParaManager(environment: .sandbox, apiKey: "preview-key"))
            .environmentObject(AppRootManager())
    }
}
