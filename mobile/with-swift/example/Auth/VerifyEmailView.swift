import SwiftUI
import ParaSwift

struct VerifyEmailView: View {
    @EnvironmentObject var paraManager: ParaManager
    @EnvironmentObject var appRootManager: AppRootManager
    
    let email: String
    
    @State private var code = ""
    @State private var isLoading = false
    @State private var loadingStateText = ""
    @State private var errorMessage: String?
    
    @Environment(\.authorizationController) private var authorizationController
    
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
                if !loadingStateText.isEmpty {
                    Text(loadingStateText)
                        .foregroundColor(.secondary)
                }
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
                loadingStateText = "Verifying..."
                Task {
                    do {
                        // Use the new verifyNewAccount method
                        let authState = try await paraManager.verifyNewAccount(verificationCode: code)
                        
                        // Check if we're in the signup stage
                        guard authState.stage == .signup else {
                            throw ParaError.error("Unexpected auth stage: \(authState.stage)")
                        }
                        
                        // If we have a passkeyId, use it to generate a passkey
                        if let passkeyId = authState.passkeyId {
                            loadingStateText = "Generating Passkey..."
                            try await paraManager.generatePasskey(identifier: email, biometricsId: passkeyId, authorizationController: authorizationController)
                            loadingStateText = "Creating Wallet..."
                            try await paraManager.createWallet(type: .evm, skipDistributable: false)
                        } else if let passwordUrl = authState.passwordUrl {
                            loadingStateText = "Setting up password..."
                            // In a real app, you would open this URL in a new window
                            // For this example, we'll just create a wallet directly
                            loadingStateText = "Creating Wallet..."
                            try await paraManager.createWallet(type: .evm, skipDistributable: false)
                        } else {
                            throw ParaError.error("No authentication method available")
                        }
                        
                        isLoading = false
                        appRootManager.currentRoot = .home
                    } catch {
                        isLoading = false
                        errorMessage = String(describing: error)
                    }
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
                // Add resend code functionality
            }
            .padding(.top)
            .accessibilityIdentifier("resendCodeButton")
            
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
