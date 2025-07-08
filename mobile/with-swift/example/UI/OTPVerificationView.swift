//
//  OTPVerificationView.swift
//  example
//
//  Created by Claude on 1/7/25.
//

import ParaSwift
import SwiftUI

struct OTPVerificationView: View {
    @EnvironmentObject var paraManager: ParaManager
    @EnvironmentObject var appRootManager: AppRootManager
    @Environment(\.dismiss) private var dismiss
    @Environment(\.authorizationController) private var authorizationController
    @Environment(\.webAuthenticationSession) private var webAuthenticationSession

    let authState: AuthState
    @Binding var showOTP: Bool

    @State private var otpText = ""
    @State private var isLoading = false
    @State private var showError = false
    @State private var errorMessage = ""
    @FocusState private var isTextFieldFocused: Bool

    private var contactDisplay: String {
        if let email = authState.email {
            email
        } else if let phone = authState.phone {
            phone
        } else {
            "your email or phone"
        }
    }

    private var isEmailAuth: Bool {
        authState.email != nil
    }

    var body: some View {
        VStack(spacing: 24) {
            // Header
            Text(isEmailAuth ? "Verify Email" : "Verify Phone")
                .font(.title2)
                .fontWeight(.semibold)
                .padding(.top, 40)

            Text("Please enter the code we sent to \(contactDisplay)")
                .font(.footnote)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal)

            // OTP Input Fields
            ZStack {
                // Hidden TextField that captures all input
                TextField("", text: $otpText)
                    .keyboardType(.numberPad)
                    .textContentType(.oneTimeCode) // Enable SMS auto-fill
                    .focused($isTextFieldFocused)
                    .opacity(0.001)
                    .blendMode(.screen)
                    .onChange(of: otpText) { newValue in
                        handleTextChange(newValue)
                    }

                // Visual representation of OTP boxes
                HStack(spacing: 12) {
                    ForEach(0 ..< 6) { index in
                        OTPDigitView(
                            digit: getDigit(at: index),
                            isActive: isTextFieldFocused && otpText.count == index,
                        )
                    }
                }
                .onTapGesture {
                    isTextFieldFocused = true
                }
            }
            .padding(.vertical, 20)

            // Resend Link
            Button("Didn't receive a code? Resend") {
                Task {
                    await resendCode()
                }
            }
            .font(.footnote)
            .foregroundColor(.gray)
            .disabled(isLoading)

            Spacer()

            // Continue Button
            Button {
                Task {
                    await verifyCode()
                }
            } label: {
                if isLoading {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                } else {
                    Text("Next: Setup Passkey")
                        .fontWeight(.medium)
                }
            }
            .frame(maxWidth: .infinity)
            .frame(height: 50)
            .background(Color.black)
            .foregroundColor(.white)
            .cornerRadius(25)
            .disabled(isLoading || otpText.count < 6)
            .padding(.horizontal, 24)
            .padding(.bottom, 40)
        }
        .onAppear {
            // Auto-focus the hidden text field after a small delay
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                isTextFieldFocused = true
            }
        }
        .alert("Error", isPresented: $showError) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(errorMessage)
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Verification code entry")
        .accessibilityValue("\(otpText.count) of \(6) digits entered")
        .accessibilityHint("Enter the \(6)-digit code sent to \(contactDisplay)")
    }

    private func getDigit(at index: Int) -> String {
        guard index < otpText.count else { return "" }
        let stringIndex = otpText.index(otpText.startIndex, offsetBy: index)
        return String(otpText[stringIndex])
    }

    private func handleTextChange(_ newValue: String) {
        // Filter to only allow digits
        let filtered = newValue.filter(\.isNumber)
        if filtered != newValue {
            otpText = filtered
        }

        // Limit to numberOfDigits
        if filtered.count > 6 {
            otpText = String(filtered.prefix(6))
        }

        // Auto-submit when all digits are entered
        if otpText.count == 6 {
            Task {
                await verifyCode()
            }
        }
    }

    private func verifyCode() async {
        let code = otpText
        guard code.count == 6 else { return }

        isLoading = true
        errorMessage = ""

        do {
            let resultState = try await paraManager.handleVerificationCode(verificationCode: code)

            switch resultState.stage {
            case .signup:
                // New user - proceed to passkey setup
                try await paraManager.handleSignup(
                    authState: resultState,
                    method: .passkey,
                    authorizationController: authorizationController,
                    webAuthenticationSession: webAuthenticationSession,
                )
                appRootManager.setAuthenticated(true)
                showOTP = false

            case .login:
                // Existing user verified - log them in
                try await paraManager.handleLogin(
                    authState: resultState,
                    authorizationController: authorizationController,
                    webAuthenticationSession: webAuthenticationSession,
                )
                appRootManager.setAuthenticated(true)
                showOTP = false

            default:
                errorMessage = "Unexpected authentication state"
                showError = true
            }
        } catch {
            errorMessage = error.localizedDescription
            showError = true
        }

        isLoading = false
    }

    private func resendCode() async {
        isLoading = true

        do {
            try await paraManager.resendVerificationCode()
        } catch {
            errorMessage = "Failed to resend code"
            showError = true
        }

        isLoading = false
    }
}

// MARK: - OTP Digit View

struct OTPDigitView: View {
    let digit: String
    let isActive: Bool

    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 8)
                .stroke(isActive ? Color.black : Color.gray.opacity(0.3), lineWidth: isActive ? 2 : 1)
                .frame(width: 48, height: 56)
                .background(
                    RoundedRectangle(cornerRadius: 8)
                        .fill(Color.gray.opacity(0.05)),
                )

            if !digit.isEmpty {
                Text(digit)
                    .font(.title)
                    .fontWeight(.semibold)
                    .foregroundColor(.black)
            }

            // Blinking cursor when active and empty
            if isActive, digit.isEmpty {
                Rectangle()
                    .fill(Color.black)
                    .frame(width: 2, height: 24)
                    .opacity(1)
                    .animation(
                        .easeInOut(duration: 0.6).repeatForever(autoreverses: true),
                        value: isActive,
                    )
            }
        }
    }
}

#Preview {
    let authState = AuthState(
        stage: .verify,
        userId: "test-user",
        email: "test@example.com",
    )

    OTPVerificationView(authState: authState, showOTP: .constant(true))
        .environmentObject(ParaManager(environment: .sandbox, apiKey: "test-key"))
        .environmentObject(AppRootManager())
}
