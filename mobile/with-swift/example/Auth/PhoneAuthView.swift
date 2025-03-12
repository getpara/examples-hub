//
//  PhoneAuthView.swift
//  example
//
//  Created by Brian Corbin on 12/27/24.
//

import SwiftUI
import ParaSwift
import Combine

struct CPData: Codable, Identifiable {
    let id: String
    let name: String
    let flag: String
    let code: String
    let dial_code: String
    let pattern: String
    let limit: Int
    
    static let allCountry: [CPData] = Bundle.main.decode("CountryNumbers.json")
    static let example = allCountry[0]
}

func applyPatternOnNumbers(_ stringvar: inout String, pattern: String, replacementCharacter: Character) {
    var pureNumber = stringvar.replacingOccurrences( of: "[^0-9]", with: "", options: .regularExpression)
    for index in 0 ..< pattern.count {
        guard index < pureNumber.count else {
            stringvar = pureNumber
            return
        }
        let stringIndex = String.Index(utf16Offset: index, in: pattern)
        let patternCharacter = pattern[stringIndex]
        guard patternCharacter != replacementCharacter else { continue }
        pureNumber.insert(patternCharacter, at: stringIndex)
    }
    stringvar = pureNumber
}

struct PhoneAuthView: View {
    @EnvironmentObject var paraManager: ParaManager
    @EnvironmentObject var appRootManager: AppRootManager
    
    @State private var phoneNumber = ""
    @State private var countryCode = "+1"
    @State private var countryFlag = "🇺🇸"
    @State private var countryPattern = "### ### ####"
    @State private var shouldNavigateToVerifyPhoneView = false
    
    // New states for error handling and loading
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var presentCountryCodeSelection = false
    
    @Environment(\.authorizationController) private var authorizationController
    
    @State private var searchCountry = ""
    private var countries: [CPData] = Bundle.main.decode("CountryNumbers.json")
    
    var filteredCountries: [CPData] {
        if searchCountry.isEmpty {
            return countries
        } else {
            return countries.filter { $0.name.localizedCaseInsensitiveContains(searchCountry)}
        }
    }
    
    var body: some View {
        VStack(spacing: 20) {
            Text("Enter your phone number to create or log in with a passkey.")
                .font(.subheadline)
                .foregroundColor(.secondary)
            
            HStack {
                Button {
                    presentCountryCodeSelection = true
                } label: {
                    Text("\(countryFlag) \(countryCode)")
                }
                .buttonStyle(.bordered)
                .sheet(isPresented: $presentCountryCodeSelection) {
                    NavigationView {
                        List(filteredCountries) { country in
                            HStack {
                                Text(country.flag)
                                Text(country.name)
                                    .font(.headline)
                                Spacer()
                                Text(country.dial_code)
                                    .foregroundColor(.secondary)
                            }
                            .onTapGesture {
                                self.countryFlag = country.flag
                                self.countryCode = country.dial_code
                                self.countryPattern = country.pattern
                                presentCountryCodeSelection = false
                                searchCountry = ""
                            }
                        }
                        .listStyle(.plain)
                        .searchable(text: $searchCountry, prompt: "Your country")
                    }
                }
                TextField("Phone Number", text: $phoneNumber)
                    .textInputAutocapitalization(.never)
                    .disableAutocorrection(true)
                    .textFieldStyle(.roundedBorder)
                    .keyboardType(.phonePad)
                    .padding(.horizontal)
                    .onReceive(Just(phoneNumber)) { _ in
                        applyPatternOnNumbers(&phoneNumber, pattern: countryPattern, replacementCharacter: "#")
                        print(phoneNumber)
                    }
            }
            
            if let errorMessage = errorMessage {
                Text(errorMessage)
                    .foregroundColor(.red)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)
            }
            
            if isLoading {
                ProgressView("Processing...")
            }
            
            Button {
                guard !phoneNumber.isEmpty else {
                    errorMessage = "Please enter a phone number."
                    return
                }
                isLoading = true
                errorMessage = nil
                Task {
                    do {
                        let userExists = try await paraManager.checkIfUserExistsByPhone(phoneNumber: phoneNumber.replacingOccurrences(of: " ", with: ""), countryCode: countryCode)
                        
                        if userExists {
                            try await paraManager.login(authorizationController: authorizationController, authInfo: PhoneAuthInfo(phone: phoneNumber.replacingOccurrences(of: " ", with: ""), countryCode: countryCode))
                            appRootManager.currentRoot = .home
                            return
                        }
                        
                        try await paraManager.createUserByPhone(phoneNumber: phoneNumber.replacingOccurrences(of: " ", with: ""), countryCode: countryCode)
                        isLoading = false
                        shouldNavigateToVerifyPhoneView = true
                    } catch {
                        errorMessage = "Failed to create user: \(error.localizedDescription)"
                        isLoading = false
                    }
                }
            } label: {
                Text("Sign Up")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
            .disabled(isLoading || phoneNumber.isEmpty)
            .navigationDestination(isPresented: $shouldNavigateToVerifyPhoneView) {
                VerifyPhoneView(phoneNumber: phoneNumber.replacingOccurrences(of: " ", with: ""), countryCode: countryCode)
            }
            
            HStack {
                Rectangle().frame(height: 1)
                Text("Or")
                Rectangle().frame(height: 1)
            }.padding(.vertical)
            
            Button {
                Task.init {
                    try await paraManager.login(authorizationController: authorizationController, authInfo: nil)
                    appRootManager.currentRoot = .home
                }
            } label: {
                Text("Log In with Passkey")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.bordered)
            
            
            Spacer()
            
        }
        .padding()
        .navigationTitle("Phone + Passkey")
    }
}

#Preview {
    NavigationStack {
        PhoneAuthView()
            .environmentObject(ParaManager(environment: .sandbox, apiKey: "preview-key"))
            .environmentObject(AppRootManager())
    }
}
