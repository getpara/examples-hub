//
//  CountryPickerView.swift
//  example
//
//  Created by Tyson Williams on 7/1/25.
//

import SwiftUI

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

// MARK: - Preview

#Preview("Country Picker") {
    struct CountryPickerPreview: View {
        @State private var selectedCode = "1"
        @State private var selectedFlag = "🇺🇸"
        @State private var selectedPattern = "### ### ####"
        @State private var selectedLimit = 10
        @State private var isPresented = true

        var body: some View {
            CountryPickerView(
                selectedCode: $selectedCode,
                selectedFlag: $selectedFlag,
                selectedPattern: $selectedPattern,
                selectedLimit: $selectedLimit,
                isPresented: $isPresented,
            )
        }
    }

    return CountryPickerPreview()
}
