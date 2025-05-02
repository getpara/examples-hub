import SwiftUI
import ParaSwift
import Combine
import AuthenticationServices

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
    @State private var countryCode = "1" // Default to US
    @State private var countryFlag = "🇺🇸"
    @State private var countryPattern = "### ### ####"
    @State private var shouldNavigateToVerifyPhone = false
    @State private var authState: AuthState?
    
    // States for error handling and loading
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var presentCountryCodeSelection = false
    
    @Environment(\.authorizationController) private var authorizationController
    @Environment(\.webAuthenticationSession) private var webAuthenticationSession
    
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
            Text("Enter your phone number to create or log in.")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
            
            HStack {
                Button {
                    presentCountryCodeSelection = true
                } label: {
                    Text("\(countryFlag) +\(countryCode)")
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
                    .accessibilityLabel("phoneInputField")
                    .onReceive(Just(phoneNumber)) { _ in
                        applyPatternOnNumbers(&phoneNumber, pattern: countryPattern, replacementCharacter: "#")
                    }
                    .accessibilityIdentifier("phoneNumberField")
            }
            
            if let errorMessage = errorMessage {
                Text(errorMessage)
                    .foregroundColor(.red)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)
                    .accessibilityIdentifier("errorMessage")
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
                        let formattedPhone = paraManager.formatPhoneNumber(phoneNumber: phoneNumber, countryCode: countryCode)
                        let state = try await paraManager.initiateAuthFlow(auth: .phone(formattedPhone))
                        self.authState = state
                        
                        switch state.stage {
                        case .verify:
                            // User needs to verify phone number
                            shouldNavigateToVerifyPhone = true
                            
                        case .login:
                            // Existing user - determine and use preferred login method
                            if let preferredMethod = paraManager.determinePreferredLoginMethod(authState: state) {
                                // Use the preferred login method based on user history
                                try await paraManager.handleLoginMethod(
                                    authState: state,
                                    method: preferredMethod,
                                    authorizationController: authorizationController,
                                    webAuthenticationSession: webAuthenticationSession
                                )
                                appRootManager.currentRoot = .home
                            } else {
                                errorMessage = "No login methods available for this account."
                            }
                            
                        case .signup:
                            // This shouldn't happen directly from phone input
                            errorMessage = "Unexpected authentication state. Please try again."
                        }
                    } catch {
                        errorMessage = error.localizedDescription
                    }
                    
                    isLoading = false
                }
            } label: {
                Text("Continue")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
            .disabled(isLoading || phoneNumber.isEmpty)
            .padding(.horizontal)
            .accessibilityIdentifier("continueButton")
            .navigationDestination(isPresented: $shouldNavigateToVerifyPhone) {
                if let state = authState {
                    VerifyPhoneView(authState: state)
                        .environmentObject(paraManager)
                        .environmentObject(appRootManager)
                }
            }
            
            Spacer()
        }
        .padding()
        .navigationTitle("Phone Authentication")
    }
}

#Preview {
    NavigationStack {
        PhoneAuthView()
            .environmentObject(ParaManager(environment: .sandbox, apiKey: "preview-key"))
            .environmentObject(AppRootManager())
    }
}
