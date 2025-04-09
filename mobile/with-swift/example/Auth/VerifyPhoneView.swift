import SwiftUI
import ParaSwift

struct VerifyPhoneView: View {
    @EnvironmentObject var paraManager: ParaManager
    @EnvironmentObject var appRootManager: AppRootManager
    
    let phoneNumber: String
    let countryCode: String
    
    @State private var code = ""
    @State private var isLoading = false
    @State private var loadingStateText = ""
    @State private var errorMessage: String?
    
    @Environment(\.authorizationController) private var authorizationController
    
    var body: some View {
        VStack(spacing: 20) {
            Text("A verification code was sent to your phone number. Enter it below to verify.")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
            
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
                        let authState = try await paraManager.verifyNewAccount(verificationCode: code)
                        
                        guard authState.stage == .signup else {
                            throw ParaError.error("Unexpected auth stage: \(authState.stage)")
                        }
                        
                        if let passkeyId = authState.passkeyId {
                            loadingStateText = "Generating Passkey..."
                            try await paraManager.generatePasskey(
                                identifier: "\(countryCode)\(phoneNumber)",
                                biometricsId: passkeyId,
                                authorizationController: authorizationController
                            )
                            loadingStateText = "Creating Wallet..."
                            try await paraManager.createWallet(type: .evm, skipDistributable: false)
                        } else if let passwordUrl = authState.passwordUrl {
                            loadingStateText = "Setting up password..."
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
            .accessibilityLabel("verifyButton")
            
            Spacer()
        }
        .padding()
        .navigationTitle("Verify Phone")
    }
}

#Preview {
    NavigationStack {
        VerifyPhoneView(phoneNumber: "1234567890", countryCode: "+1")
            .environmentObject(ParaManager(environment: .sandbox, apiKey: "preview-key"))
            .environmentObject(AppRootManager())
    }
}

