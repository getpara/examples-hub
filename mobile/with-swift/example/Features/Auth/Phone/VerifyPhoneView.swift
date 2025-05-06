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
                loadingStateText = "Creating wallet..."
                
                Task {
                    // Clean up phone number and country code
                    let cleanPhoneNumber = phoneNumber.replacingOccurrences(of: " ", with: "")
                    let cleanCountryCode = countryCode.replacingOccurrences(of: "+", with: "")
                    
                    let result = await paraManager.handlePhoneAuth(
                        phoneNumber: cleanPhoneNumber,
                        countryCode: cleanCountryCode,
                        verificationCode: code,
                        authorizationController: authorizationController
                    )
                    
                    isLoading = false
                    
                    switch result.status {
                    case .success:
                        // Authentication successful, navigate to home
                        appRootManager.currentRoot = .home
<<<<<<< HEAD:mobile/with-swift/example/Features/Auth/Phone/VerifyPhoneView.swift
                        
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
>>>>>>> main:mobile/with-swift/example/Auth/VerifyPhoneView.swift
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

