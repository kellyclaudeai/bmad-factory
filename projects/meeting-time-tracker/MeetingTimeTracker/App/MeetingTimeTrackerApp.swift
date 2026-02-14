import SwiftUI
import SwiftData

@main
struct MeetingTimeTrackerApp: App {
    let modelContainer: ModelContainer
    
    init() {
        do {
            let schema = Schema([
                // Models will be added in subsequent stories
            ])
            
            let modelConfiguration = ModelConfiguration(
                schema: schema,
                isStoredInMemoryOnly: false,
                cloudKitDatabase: .none
            )
            
            modelContainer = try ModelContainer(
                for: schema,
                configurations: [modelConfiguration]
            )
        } catch {
            fatalError("Failed to initialize SwiftData: \(error)")
        }
    }
    
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .modelContainer(modelContainer)
    }
}
