import Foundation

/// Country phone data structure for storing information about country phone codes and formatting
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

/// Utility class for phone number formatting
class PhoneFormatter {
    /// Formats a phone number string according to a specified pattern for display
    /// - Parameters:
    ///   - stringvar: The phone number string to format (will be modified in-place)
    ///   - pattern: The pattern to apply (e.g., "### ### ####")
    ///   - replacementCharacter: The character in the pattern to replace with digits (typically "#")
    static func applyPatternOnNumbers(_ stringvar: inout String, pattern: String, replacementCharacter: Character) {
        var pureNumber = stringvar.replacingOccurrences(of: "[^0-9]", with: "", options: .regularExpression)
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

    /// Formats a phone number for API use in the international format
    /// - Parameters:
    ///   - phoneNumber: The phone number to format (may contain formatting characters)
    ///   - countryCode: The country code (without the plus sign)
    /// - Returns: Formatted phone number in international format (+${countryCode}${phoneNumber})
    static func formatForAPI(phoneNumber: String, countryCode: String) -> String {
        // Normalize the phone number input by removing non-digit characters
        let normalizedPhoneNumber = phoneNumber.replacingOccurrences(of: "[^0-9]", with: "", options: .regularExpression)
        return "+\(countryCode)\(normalizedPhoneNumber)"
    }
}
