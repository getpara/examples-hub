//
//  ConnectSocialButton.swift
//  example
//
//  Created by Tyson Williams on 7/1/25.
//

import ParaSwift
import SwiftUI

struct ConnectSocialButton: View {
    let provider: OAuthProvider
    let isLoading: Bool
    let action: (OAuthProvider) -> Void

    private var image: ImageResource {
        switch provider {
        case .google:
            .google
        case .apple:
            .apple
        case .discord:
            .discord
        }
    }

    var body: some View {
        Button(action: { action(provider) }) {
            ZStack {
                if isLoading {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .gray))
                        .scaleEffect(0.8)
                } else {
                    Image(image)
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .frame(width: 32, height: 32)
                }
            }
            .frame(width: 110, height: 83)
            .background(Color("paraLightGray"))
            .clipShape(RoundedRectangle(cornerRadius: 12))
        }
        .disabled(isLoading)
    }
}

// MARK: - Preview

#Preview("Social Buttons") {
    HStack(spacing: 12) {
        ConnectSocialButton(provider: .google, isLoading: false) { _ in }
        ConnectSocialButton(provider: .apple, isLoading: true) { _ in }
        ConnectSocialButton(provider: .discord, isLoading: false) { _ in }
    }
    .padding()
}
