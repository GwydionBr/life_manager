import { workProjectsCollection } from "@/db/collections/work/work-project/work-project-collection";
import { connector } from "@/db/powersync/db";

export async function addTestProject() {
  try {
    // Hole die aktuelle Session für die user_id
    const {
      data: { session },
      error: sessionError,
    } = await connector.client.auth.getSession();

    if (sessionError || !session) {
      throw new Error("No active session found");
    }

    const userId = session.user.id;

    // Erstelle ein Test-Projekt mit allen erforderlichen Feldern
    const testProject = {
      id: crypto.randomUUID(),
      title: "Test Project 4",
      description: "Dies ist ein automatisch erstelltes Test-Projekt",
      salary: 50,
      currency: "EUR" as const,
      is_favorite: false,
      hourly_payment: true,
      order_index: 0,
      color: "#ff6b6b",
      total_payout: 0,
      user_id: userId,
      created_at: new Date().toISOString(),
      cash_flow_category_id: null,
      finance_project_id: null,
      folder_id: null,
      round_in_time_fragments: null,
      rounding_direction: null,
      rounding_interval: null,
      time_fragment_interval: null,
    };

    // Füge das Projekt über die TanStack Collection ein
    workProjectsCollection.insert(testProject);

    console.log("Test project created successfully:", testProject);
    return testProject;
  } catch (error) {
    console.error("Failed to add test project:", error);
    throw error;
  }
}
