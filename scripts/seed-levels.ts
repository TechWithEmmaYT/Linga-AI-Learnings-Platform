import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

const LEVELS = [
  { level_number: 1, title: "Greetings & Basics", purpose: "Learn hello, please, thank you etc" },
  { level_number: 2, title: "Numbers & Counting", purpose: "Learn numbers 1-20" },
  { level_number: 3, title: "Colors & Descriptions", purpose: "Learn colors, big, small, beautiful" },
  { level_number: 4, title: "Food & Drinks", purpose: "Learn water, coffee, I want, I like" },
  { level_number: 5, title: "Family & People", purpose: "Learn mother, father, my name is" },
  { level_number: 6, title: "Directions & Places", purpose: "Learn left, right, where is, hotel" },
  { level_number: 7, title: "Time & Days", purpose: "Learn today, tomorrow, days of the week" },
  { level_number: 8, title: "Shopping & Money", purpose: "Learn how much, too expensive, I'll take it" },
  { level_number: 9, title: "Emotions & Feelings", purpose: "Learn happy, sad, tired, I feel, I love" },
  { level_number: 10, title: "Full Conversation", purpose: "Have a real conversation using everything learned" },
]

async function seedLevels() {
  try {
    // Dynamic import here
    const { createClient } = await import("@insforge/sdk");

    const insforge = createClient({
      baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL || "",
      anonKey: process.env.INSFORGE_ANON_KEY || process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || "",
    });
    console.log("Seeding levels...")

    const { data: courses, error } = await insforge.database
      .from("courses").select("id, title")

    if (error || !courses?.length) {
      console.error("No courses found:", error); return
    }

    for (const course of courses) {
      const { error: insertError } = await insforge.database
        .from("levels")
        .insert(LEVELS.map(l => ({ ...l, course_id: course.id })))

      if (insertError) {
        console.error(`${course.title}:`, insertError.message)
      } else {
        console.log(`${course.title} — 10 levels seeded`)
      }
    }

    console.log("Done.")
  } catch (error) {
    console.error("Error:", error)
  }
}

if (process.argv[1]?.endsWith("seed-levels.ts")) seedLevels()

// npx tsx script/seed-levels.ts
