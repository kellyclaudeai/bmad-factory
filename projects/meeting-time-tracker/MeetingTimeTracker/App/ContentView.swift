import SwiftUI

struct ContentView: View {
    var body: some View {
        TabView {
            Text("Meetings")
                .tabItem {
                    Label("Meetings", systemImage: "calendar")
                }
            
            Text("Settings")
                .tabItem {
                    Label("Settings", systemImage: "gear")
                }
        }
    }
}

#Preview {
    ContentView()
}
