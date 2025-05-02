import SwiftUI
import ParaSwift
import AuthenticationServices

struct VerifyPhoneView: View {
    @EnvironmentObject var paraManager: ParaManager
    @EnvironmentObject var appRootManager: AppRootManager
    
    let authState: AuthState
    
    @State private var code = ""
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var shouldNavigateToChooseMethod = false
    @State private var verifiedAuthState: AuthState? = nil
    @State private var resendInProgress = false
    @State private var justResent = false
    
    @Environment(\.authorizationController) private var authorizationController
    @Environment(\.webAuthenticationSession) private var webAuthenticationSession
    
    // Helper to get phone information from the auth state for display
    private var phoneDisplay: String {
        if let phoneIdentity = authState.authIdentity as? PhoneIdentity {
            return phoneIdentity.identifier
        } else {
            return "your phone"
        }
    }
    
    var body: some View {
        VStack(spacing: 20) {
            Text("A verification code was sent to \(phoneDisplay). Enter it below to verify.")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
            
            TextField("Verification Code", text: $code)
                .textInputAutocapitalization(.never)
                .disableAutocorrection(true)
                .textFieldStyle(.roundedBorder)
                .padding(.horizontal)
                .keyboardType(.numberPad)
                .disabled(isLoading)
                .accessibilityIdentifier("verificationCodeField")
            
            if let errorMessage = errorMessage {
                Text(errorMessage)
                    .foregroundColor(.red)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)
                    .accessibilityIdentifier("errorMessage")
                    .lineLimit(4, reservesSpace: true)
            }
            
            if isLoading {
                ProgressView()
            }
            
            if justResent {
                Text("Verification code resent")
                    .foregroundColor(.green)
                    .font(.subheadline)
                    .padding(.top, 4)
            }
            
            Button {
                guard !code.isEmpty else {
                    errorMessage = "Please enter the verification code."
                    return
                }
                isLoading = true
                errorMessage = nil
                
                Task {
                    do {
                        // Use new API method
                        let resultState = try await paraManager.handleVerificationCode(verificationCode: code)
                        
                        if resultState.stage == .signup {
                            // Verification successful for a new account
                            verifiedAuthState = resultState
                            shouldNavigateToChooseMethod = true
                        } else {
                            // Handle unexpected state (e.g., already logged in, etc.)
                            errorMessage = "Unexpected account state after verification: \(resultState.stage). Please try logging in again."
                        }
                    } catch {
                        errorMessage = "Verification failed: \(error.localizedDescription)"
                    }
                    
                    isLoading = false
                }
            } label: {
                Text("Verify")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
            .disabled(isLoading || code.isEmpty)
            .padding(.horizontal)
            .accessibilityIdentifier("verifyButton")
            
            Button {
                Task {
                    await resendVerificationCode()
                }
            } label: {
                Text("Resend Code")
                    .foregroundColor(resendInProgress ? .gray : .blue)
            }
            .disabled(resendInProgress)
            .padding(.top)
            .accessibilityIdentifier("resendCodeButton")
            
            .navigationDestination(isPresented: $shouldNavigateToChooseMethod) {
                if let verifiedState = verifiedAuthState {
                    ChooseSignupMethodView(authState: verifiedState)
                        .environmentObject(paraManager)
                        .environmentObject(appRootManager)
                }
            }
            
            Spacer()
        }
        .padding()
        .navigationTitle("Verify Phone")
    }
    
    // MARK: - Helper Methods
    
    @MainActor
    private func resendVerificationCode() async {
        guard !resendInProgress else { return }
        
        resendInProgress = true
        errorMessage = nil
        
        do {
            try await paraManager.resendVerificationCode()
            
            // Show success message temporarily
            withAnimation {
                justResent = true
            }
            
            // Hide the message after 3 seconds
            DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
                withAnimation {
                    justResent = false
                }
            }
        } catch {
            errorMessage = "Failed to resend code: \(error.localizedDescription)"
        }
        
        resendInProgress = false
    }
}

#Preview {
    // Create a sample AuthState for previewing
    let sampleAuthState = AuthState(
        stage: .verify,
        userId: "preview-user-id",
        authIdentity: PhoneIdentity(phone: "+15551234")
    )
    
    NavigationStack {
        VerifyPhoneView(authState: sampleAuthState)
            .environmentObject(ParaManager(environment: .sandbox, apiKey: "preview-key"))
            .environmentObject(AppRootManager())
    }
}
