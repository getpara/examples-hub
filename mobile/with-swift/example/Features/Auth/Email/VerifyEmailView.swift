import SwiftUI
import ParaSwift
import AuthenticationServices

struct VerifyEmailView: View {
    @EnvironmentObject var paraManager: ParaManager
    @EnvironmentObject var appRootManager: AppRootManager
    
    let authState: AuthState
    
    @State private var code = ""
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var shouldNavigateToChooseMethod = false
    @State private var verifiedAuthState: AuthState? = nil
    @State private var showResendSuccess = false
    
    // Helper to get the email from the auth state
    private var emailDisplay: String {
        if let email = authState.email {
            return email
        } else {
            return "your email"
        }
    }
    
    var body: some View {
        VStack(spacing: 25) {
            // Verification header
            Image(systemName: "checkmark.shield.fill")
                .font(.system(size: 50))
                .foregroundColor(.green)
                .padding(.bottom)
            
            // Instructions
            Text("Check your inbox")
                .font(.headline)
            
            Text("We've sent a verification code to\n\(emailDisplay)")
                .multilineTextAlignment(.center)
                .foregroundColor(.secondary)
            
            // Code input field
            TextField("Enter verification code", text: $code)
                .keyboardType(.numberPad)
                .padding()
                .frame(minHeight: 50)
                .background(Color(.systemGray6))
                .cornerRadius(10)
                .padding(.horizontal)
                .accessibilityIdentifier("verificationCodeField")
            
            // Error message display
            if let errorMessage = errorMessage {
                Text(errorMessage)
                    .foregroundColor(.red)
                    .font(.callout)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)
                    .accessibilityIdentifier("errorMessage")
            }
            
            // Resend success message
            if showResendSuccess {
                Text("Code resent!")
                    .foregroundColor(.green)
                    .font(.subheadline)
                    .padding(6)
                    .background(Color.green.opacity(0.1))
                    .cornerRadius(5)
            }
            
            // Verify button
            Button {
                verifyCode()
            } label: {
                if isLoading {
                    ProgressView().tint(.white)
                } else {
                    Text("Verify")
                        .fontWeight(.semibold)
                }
            }
            .frame(maxWidth: .infinity)
            .padding()
            .background(Color.blue)
            .foregroundColor(.white)
            .cornerRadius(10)
            .padding(.horizontal)
            .disabled(isLoading || code.isEmpty)
            .accessibilityIdentifier("verifyButton")
            
            // Resend button
            Button("Didn't receive code? Resend") {
                resendCode()
            }
            .font(.subheadline)
            .disabled(isLoading)
            .padding(.top, 5)
            .accessibilityIdentifier("resendCodeButton")
            
            // Navigation
            .navigationDestination(isPresented: $shouldNavigateToChooseMethod) {
                if let verifiedState = verifiedAuthState {
                    ChooseSignupMethodView(authState: verifiedState)
                }
            }
            
            Spacer()
        }
        .padding()
        .navigationTitle("Verify Email")
    }
    
    // Verify the code entered by user
    private func verifyCode() {
        guard !code.isEmpty else {
            errorMessage = "Please enter the verification code"
            return
        }
        
        isLoading = true
        errorMessage = nil
        
        Task {
            do {
                let resultState = try await paraManager.handleVerificationCode(verificationCode: code)
                
                if resultState.stage == .signup {
                    verifiedAuthState = resultState
                    shouldNavigateToChooseMethod = true
                } else {
                    errorMessage = "Unexpected verification result"
                }
            } catch {
                errorMessage = "Verification failed: \(error.localizedDescription)"
            }
            
            isLoading = false
        }
    }
    
    // Resend verification code
    private func resendCode() {
        guard !isLoading else { return }
        
        isLoading = true
        errorMessage = nil
        
        Task {
            do {
                try await paraManager.resendVerificationCode()
                
                // Show success message
                withAnimation {
                    showResendSuccess = true
                }
                
                // Hide after 3 seconds
                DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
                    withAnimation {
                        showResendSuccess = false
                    }
                }
            } catch {
                errorMessage = "Failed to resend code"
            }
            
            isLoading = false
        }
    }
}

#Preview {
    let sampleAuthState = AuthState(
        stage: .verify,
        userId: "preview-user-id",
        email: "test@example.com"
    )
    
    return NavigationStack {
        VerifyEmailView(authState: sampleAuthState)
            .environmentObject(ParaManager(environment: .sandbox, apiKey: "preview-key"))
            .environmentObject(AppRootManager())
    }
}