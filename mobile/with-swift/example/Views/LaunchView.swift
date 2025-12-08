import SwiftUI

struct LaunchView: View {
    var body: some View {
        VStack {
            Image("launchIcon")
                .resizable()
                .scaledToFit()
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(red: 251 / 255, green: 249 / 255, blue: 247 / 255))
    }
}

#Preview {
    LaunchView()
}
