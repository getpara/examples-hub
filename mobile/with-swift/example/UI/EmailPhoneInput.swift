//
//  EmailPhoneInput.swift
//  example
//
//  Created by Claude on 6/30/25.
//

import Combine
import SwiftUI

struct EmailPhoneInput: View {
    @Binding var text: String
    @FocusState.Binding var isFocused: Bool
    let onContinue: () -> Void

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
            return isValidEmail(text)
        case .phone:
            return isValidPhone(text)
        case .unknown:
            return false
        }
    }

    var body: some View {
        VStack(spacing: 12) {
            inputField
            
            if shouldShowContinueButton {
                continueButton
                    .transition(.opacity)
            }
        }
        .animation(.easeInOut(duration: 0.3), value: shouldShowContinueButton)
    }

    private var inputField: some View {
        HStack(spacing: 8) {
            if inputType != .unknown && text.isEmpty {
                inputIcon
            }
            
            if inputType == .phone {
                countrySelector
            }
            
            TextField("Enter email or phone", text: $text)
                .focused($isFocused)
                .keyboardType(keyboardType)
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
        Image(systemName: inputType == .email ? "envelope" : "phone")
            .foregroundColor(.gray)
            .transition(.scale.combined(with: .opacity))
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
                isPresented: $showCountryPicker
            )
        }
    }

    private var continueButton: some View {
        Button("Continue", action: onContinue)
            .font(.callout.weight(.medium))
            .foregroundColor(.white)
            .frame(maxWidth: .infinity)
            .frame(height: 50)
            .background(isInputValid ? .paraOrange : Color(.systemGray4))
            .clipShape(Capsule())
            .disabled(!isInputValid)
    }

    private var keyboardType: UIKeyboardType {
        inputType == .phone ? .phonePad : .emailAddress
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
            PhoneFormatter.formatForAPI(phoneNumber: text, countryCode: countryCode)
        case .email, .unknown:
            text
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

// MARK: - Country Picker

struct CountryPickerView: View {
    @Binding var selectedCode: String
    @Binding var selectedFlag: String
    @Binding var selectedPattern: String
    @Binding var selectedLimit: Int
    @Binding var isPresented: Bool
    
    @State private var searchText = ""
    private let countries = CPData.allCountry
    
    private var filteredCountries: [CPData] {
        searchText.isEmpty ? countries : countries.filter {
            $0.name.localizedCaseInsensitiveContains(searchText)
        }
    }

    var body: some View {
        NavigationView {
            List(filteredCountries) { country in
                CountryRow(country: country) {
                    selectedCode = String(country.dial_code.dropFirst())
                    selectedFlag = country.flag
                    selectedPattern = country.pattern
                    selectedLimit = country.limit
                    isPresented = false
                }
            }
            .listStyle(.plain)
            .searchable(text: $searchText, prompt: "Search countries")
            .navigationTitle("Select Country")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Cancel") { isPresented = false }
                }
            }
        }
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
                    text: $text,
                    isFocused: $isFocused,
                    onContinue: { print("Continue tapped") },
                )
                .padding()

                Spacer()
            }
        }
    }

    return PreviewWrapper()
}
