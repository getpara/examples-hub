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
                loadingStateText = "Creating wallet..."
                
                Task {
                    let result = await paraManager.handleEmailAuth(
                        email: email,
                        verificationCode: code,
                        authorizationController: authorizationController
                    )
                    
                    isLoading = false
                    
                    switch result.status {
                    case .success:
                        // Authentication successful, navigate to home
                        appRootManager.currentRoot = .home
<<<<<<< HEAD:mobile/with-swift/example/Features/Auth/Email/VerifyEmailView.swift
                        
                    case .needsVerification:
                        // This shouldn't happen when verification code is provided
                        errorMessage = "Unexpected verification required"
                        
                    case .error:
                        // Error occurred
                        errorMessage = result.errorMessage
=======
                    } catch {
                        isLoading = false
                        errorMessage = String(describing: error)
>>>>>>> main:mobile/with-swift/example/Auth/VerifyEmailView.swift
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
