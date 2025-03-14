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
            
            TextField("Verification Code", text: $code)
                .textInputAutocapitalization(.never)
                .disableAutocorrection(true)
                .textFieldStyle(.roundedBorder)
                .padding(.horizontal)
                .disabled(isLoading)
                .accessibilityIdentifier("codeInput-0")
                .accessibilityLabel("Verification Code")
            
            if let errorMessage = errorMessage {
                Text(errorMessage)
                    .foregroundColor(.red)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)
                    .accessibilityIdentifier("errorMessage")
            }
            
            if isLoading {
                if !loadingStateText.isEmpty {
                    Text(loadingStateText)
                        .foregroundColor(.secondary)
                }
                ProgressView()
            }
            
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
                        let biometricsId = try await paraManager.verify(verificationCode: code)
                        loadingStateText = "Generating Passkey..."
                        try await paraManager.generatePasskey(identifier: email, biometricsId: biometricsId, authorizationController: authorizationController)
                        loadingStateText = "Creating Wallet..."
                        try await paraManager.createWallet(type: .evm, skipDistributable: false)
                        isLoading = false
                        appRootManager.currentRoot = .home
                    } catch {
                        isLoading = false
                        errorMessage = "Verification failed: \(error.localizedDescription)"
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
            .accessibilityLabel("Verify Button")
            
            Button("Resend Code") {
                // Add resend code functionality
            }
            .padding(.top)
            .accessibilityIdentifier("resendCodeButton")
            
            Spacer()
        }
        .padding()
        .navigationTitle("Verify Email")
        .accessibilityIdentifier("verifyEmailView")
    }
}

#Preview {
    NavigationStack {
        VerifyEmailView(email: "test@example.com")
            .environmentObject(ParaManager(environment: .sandbox, apiKey: "preview-key"))
            .environmentObject(AppRootManager())
    }
}

