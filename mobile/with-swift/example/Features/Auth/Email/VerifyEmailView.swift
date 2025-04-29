import SwiftUI
import ParaSwift
import AuthenticationServices

struct VerifyEmailView: View {
    @EnvironmentObject var paraManager: ParaManager
    @EnvironmentObject var appRootManager: AppRootManager
    
    let email: String
    
    @State private var code = ""
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var shouldNavigateToChooseMethod = false
    @State private var verifiedAuthState: AuthState? = nil
    
    @Environment(\.authorizationController) private var authorizationController
    @Environment(\.webAuthenticationSession) private var webAuthenticationSession
    
    var body: some View {
        VStack(spacing: 20) {
            Text("A verification code was sent to your email. Enter it below to verify.")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
            
            // MARK: - Verification Code Field
            TextField("Verification Code", text: $code)
                .textInputAutocapitalization(.never)
                .disableAutocorrection(true)
                .textFieldStyle(.roundedBorder)
                .padding(.horizontal)
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
            
            // MARK: - Verify Button
            Button {
                guard !code.isEmpty else {
                    errorMessage = "Please enter the verification code."
                    return
                }
                isLoading = true
                errorMessage = nil
                
                Task {
                    do {
                        let authState = try await paraManager.verifyNewAccount(verificationCode: code)
                        
                        if authState.stage == .signup {
                            // Verification successful for a new account
                            verifiedAuthState = authState
                            shouldNavigateToChooseMethod = true
                        } else {
                            // Handle unexpected state (e.g., already logged in, etc.)
                            errorMessage = "Unexpected account state after verification: \(authState.stage). Please try logging in again."
                        }
                        
                    } catch let error as ParaError {
                        errorMessage = error.description
                    } catch {
                        errorMessage = "An unexpected error occurred during verification: \(error.localizedDescription)"
                    }

                    isLoading = false
                }
            } label: {
                Group {
                    if isLoading {
                        Text("Working...")
                    } else {
                        Text("Verify")
                    }
                }
                .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
            .disabled(isLoading || code.isEmpty)
            .padding(.horizontal)
            .accessibilityIdentifier("verifyButton")
            
            // MARK: - Resend Code Button
            Button("Resend Code") {
                Task {
                    do {
                        try await paraManager.resendVerificationCode()
                    } catch {
                        errorMessage = "Failed to resend code: \(error.localizedDescription)"
                    }
                }
            }
            .padding(.top)
            .accessibilityIdentifier("resendCodeButton")
            
            .navigationDestination(isPresented: $shouldNavigateToChooseMethod) {
                if let authState = verifiedAuthState {
                    ChooseSignupMethodView(authState: authState)
                        .environmentObject(paraManager)
                        .environmentObject(appRootManager)
                }
            }

            Spacer()
        }
        .padding()
        .navigationTitle("Verify Email")
    }
}

#Preview {
    NavigationStack {
        VerifyEmailView(email: "test@example.com")
            .environmentObject(ParaManager(environment: .sandbox, apiKey: "preview-key"))
            .environmentObject(AppRootManager())
    }
}
