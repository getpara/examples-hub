//
//  WalletSelectionSheet.swift
//  example
//
//  Created by Tyson Williams on 7/1/25.
//

import SwiftUI
import ParaSwift

struct WalletSelectionSheet: View {
    @Binding var showWalletSelection: Bool
    let handleWalletConnect: (WalletProvider) -> Void
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                Text("Select a wallet")
                    .font(.headline)
                    .padding(.top, 20)
                    .padding(.bottom, 30)
                
                VStack(spacing: 16) {
                    ConnectExternalWalletButton(provider: .metamask) { provider in
                        handleWalletConnect(provider)
                        showWalletSelection = false
                    }
                    .padding(.horizontal, 24)
                }
                
                Spacer()
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Cancel") {
                        showWalletSelection = false
                    }
                }
            }
        }
    }
}

// MARK: - Preview

#Preview {
    WalletSelectionSheet(
        showWalletSelection: .constant(true),
        handleWalletConnect: { provider in
            print("Selected wallet: \(provider)")
        }
    )
}
