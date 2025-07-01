//
//  ConnectSocialButton.swift
//  example
//
//  Created by Tyson Williams on 7/1/25.
//

import SwiftUI
import ParaSwift

struct ConnectSocialButton: View {
    let provider: OAuthProvider
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
            Image(image)
                .resizable()
                .aspectRatio(contentMode: .fit)
                .frame(height: 24)
                .frame(maxWidth: .infinity)
                .frame(height: 64)
                .background(.lightGray)
                .clipShape(RoundedRectangle(cornerRadius: 12))
        }
    }
}

// MARK: - Preview

#Preview("Social Buttons") {
    HStack(spacing: 12) {
        ConnectSocialButton(provider: .google) { _ in }
        ConnectSocialButton(provider: .apple) { _ in }
        ConnectSocialButton(provider: .discord) { _ in }
    }
    .padding()
}
