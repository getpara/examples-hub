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
            // Header
            Image(systemName: "envelope.fill")
                .font(.system(size: 50))
                .foregroundColor(.blue)
                .padding(.bottom, 10)
            
            Text("Enter your email address")
                .font(.headline)
            
            // Email input field
            TextField("email@example.com", text: $email)
                .textInputAutocapitalization(.never)
                .keyboardType(.emailAddress)
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(10)
                .padding(.horizontal)
                .accessibilityIdentifier("emailInputField")
            
            // Error message (if any)
            if let errorMessage = errorMessage {
                Text(errorMessage)
                    .foregroundColor(.red)
                    .font(.callout)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)
                    .accessibilityIdentifier("errorMessage")
            }
            
            // Submit button with loading indicator
            Button {
                submitEmail()
            } label: {
                if isLoading {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle())
                        .tint(.white)
                } else {
                    Text("Continue")
                        .fontWeight(.semibold)
                }
            }
            .frame(maxWidth: .infinity)
            .padding()
            .background(Color.blue)
            .foregroundColor(.white)
            .cornerRadius(10)
            .padding(.horizontal)
            .disabled(isLoading)
            .accessibilityIdentifier("continueButton")
            
            // Navigation to verification screen
            .navigationDestination(isPresented: $shouldNavigateToVerifyEmail) {
                if let state = authState {
                    VerifyEmailView(authState: state)
                }
            }
            
            Spacer()
        }
        .padding()
        .navigationTitle("Email")
    }
    
    // Submit email and handle authentication flow
    private func submitEmail() {
        // Clear previous errors
        errorMessage = nil
        
        // Basic validation
        guard !email.isEmpty else {
            errorMessage = "Please enter an email address"
            return
        }
        
        isLoading = true
        
        Task {
            do {
                // Start authentication flow with Para SDK
                let state = try await paraManager.initiateAuthFlow(auth: .email(email))
                self.authState = state
                
                switch state.stage {
                case .verify:
                    // New user - navigate to verification
                    shouldNavigateToVerifyEmail = true
                    
                case .login:
                    // Existing user - log them in with automatic method selection
                    try await paraManager.handleLogin(
                        authState: state,
                        authorizationController: authorizationController,
                        webAuthenticationSession: webAuthenticationSession
                    )
                    appRootManager.currentRoot = .home
                    
                case .signup:
                    // This shouldn't happen directly
                    errorMessage = "Unexpected authentication state"
                }
            } catch {
                // Handle any errors
                errorMessage = error.localizedDescription
            }
            
            isLoading = false
        }
    }
}

#Preview {
    NavigationStack {
        EmailAuthView()
            .environmentObject(ParaManager(environment: .sandbox, apiKey: "preview-key"))
            .environmentObject(AppRootManager())
    }
}
