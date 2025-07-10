//
//  EmailPhoneInput.swift
//  example
//
//  Created by Claude on 6/30/25.
//

import Combine
import ParaSwift
import SwiftUI

struct EmailPhoneInput: View {
    @FocusState.Binding var isFocused: Bool
    let onContinue: (Auth) -> Void

    @State private var text = ""
    @State private var inputType: InputType = .unknown
    @State private var countryCode = "1"
    @State private var countryFlag = "🇺🇸"
    @State private var countryPattern = "### ### ####"
    @State private var countryLimit = 10
    @State private var showCountryPicker = false

    enum InputType {
        case email, phone, unknown
    }

    private var shouldShowContinueButton: Bool {
        isFocused && !text.isEmpty
    }

    private var isInputValid: Bool {
        switch inputType {
        case .email:
            isValidEmail(text)
        case .phone:
            isValidPhone(text)
        case .unknown:
            false
        }
    }

    var body: some View {
        VStack(spacing: 12) {
            inputField

            if shouldShowContinueButton {
                continueButton
            }
        }
        .animation(.easeInOut(duration: 0.3), value: shouldShowContinueButton)
    }

    private var inputField: some View {
        HStack(spacing: 8) {
            if text.isEmpty {
                inputIcon
            }

            if inputType == .phone {
                countrySelector
            }

            TextField("Enter email or phone", text: $text)
                .focused($isFocused)
                .textContentType(textContentType)
                .autocapitalization(.none)
                .disableAutocorrection(true)
                .onChange(of: text) { _ in
                    updateInputType()
                    if inputType == .phone {
                        formatPhoneNumber()
                    }
                }
        }
        .padding()
        .background(Color(.systemGray6))
        .clipShape(RoundedRectangle(cornerRadius: 8))
        .animation(.easeInOut(duration: 0.15), value: inputType)
    }

    private var inputIcon: some View {
        HStack {
            Image(systemName: "envelope")
                .foregroundColor(.gray)
            Image(systemName: "phone")
                .foregroundColor(.gray)
        }
    }

    private var countrySelector: some View {
        Button(action: { showCountryPicker = true }) {
            Text("\(countryFlag) +\(countryCode)")
                .font(.callout)
                .foregroundColor(.primary)
        }
        .sheet(isPresented: $showCountryPicker) {
            CountryPickerView(
                selectedCode: $countryCode,
                selectedFlag: $countryFlag,
                selectedPattern: $countryPattern,
                selectedLimit: $countryLimit,
                isPresented: $showCountryPicker,
            )
        }
    }

    private var continueButton: some View {
        Button("Continue") {
            print("Continue button tapped")
            let authValue: Auth = inputType == .phone ? .phone(formattedValue) : .email(formattedValue)
            onContinue(authValue)
        }
        .font(.headline)
        .foregroundColor(isInputValid ? .white : .secondary)
        .frame(maxWidth: .infinity)
        .frame(height: 50)
        .background(isInputValid ? .black : Color(.systemGray5))
        .clipShape(RoundedRectangle(cornerRadius: 10))
        .disabled(!isInputValid)
    }

    private var textContentType: UITextContentType? {
        inputType == .phone ? .telephoneNumber : .emailAddress
    }

    private func updateInputType() {
        let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)

        if trimmed.isEmpty {
            inputType = .unknown
        } else if trimmed.contains("@") {
            inputType = .email
        } else if trimmed.rangeOfCharacter(from: .decimalDigits) != nil {
            inputType = .phone
        } else {
            inputType = .unknown
        }
    }

    private func formatPhoneNumber() {
        PhoneFormatter.applyPatternOnNumbers(&text, pattern: countryPattern, replacementCharacter: "#", limit: countryLimit)
    }

    var formattedValue: String {
        switch inputType {
        case .phone:
            let digitsOnly = text.replacingOccurrences(of: "[^0-9]", with: "", options: .regularExpression)
            return ParaFormatting.formatPhoneNumber(phoneNumber: digitsOnly, countryCode: countryCode) ?? text
        case .email, .unknown:
            return text
        }
    }

    private func isValidEmail(_ email: String) -> Bool {
        let emailRegex = #"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"#
        return NSPredicate(format: "SELF MATCHES %@", emailRegex).evaluate(with: email)
    }

    private func isValidPhone(_ phone: String) -> Bool {
        let digitsOnly = phone.replacingOccurrences(of: "[^0-9]", with: "", options: .regularExpression)
        return digitsOnly.count == countryLimit
    }
}

struct CountryRow: View {
    let country: CPData
    let onTap: () -> Void

    var body: some View {
        HStack {
            Text(country.flag)
                .font(.title2)

            Text(country.name)
                .font(.headline)

            Spacer()

            Text(country.dial_code)
                .foregroundColor(.secondary)
        }
        .contentShape(Rectangle())
        .onTapGesture(perform: onTap)
    }
}

#Preview {
    struct PreviewWrapper: View {
        @State private var text = ""
        @FocusState private var isFocused: Bool

        var body: some View {
            VStack {
                EmailPhoneInput(
                    isFocused: $isFocused,
                    onContinue: { auth in print("Continue tapped with: \(auth)") },
                )
                .padding()

                Spacer()
            }
        }
    }

    return PreviewWrapper()
}
