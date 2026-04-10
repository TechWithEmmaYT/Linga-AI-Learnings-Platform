import { loadEnvConfig } from '@next/env';
const projectDir = process.cwd();
loadEnvConfig(projectDir);

//import { createClient } from "@insforge/sdk";
import fs from "fs";
import path from "path";

// const insforge = createClient({
//   baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL || "",
//   anonKey: process.env.INSFORGE_ANON_KEY || process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || "",
// });

const langCodes: Record<string, string> = {
  spanish: "es-ES", english: "en-US", hindi: "hi-IN",
  chinese: "zh-CN", german: "de-DE", italian: "it-IT",
  french: "fr-FR", portuguese: "pt-PT", japanese: "ja-JP",
  korean: "ko-KR", arabic: "ar-SA", russian: "ru-RU",
  dutch: "nl-NL", greek: "el-GR", swedish: "sv-SE",
  polish: "pl-PL", turkish: "tr-TR", vietnamese: "vi-VN",
  irish: "ga-IE", latin: "la-VA",
}

const COURSE_ORDER = [
  "spanish", "hindi", "chinese", "german", "italian",
  "french", "english", "portuguese", "japanese", "korean", "arabic",
  "russian", "dutch", "greek", "swedish", "polish",
  "turkish", "vietnamese", "irish", "latin"
]

export async function seedCourses() {
  try {
    // Dynamic import here
    const { createClient } = await import("@insforge/sdk");

    const insforge = createClient({
      baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL || "",
      anonKey: process.env.INSFORGE_ANON_KEY || process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || "",
    });

    console.log("Starting to seed courses...")

    const bucketName = "langs"
    const baseDir = path.join(process.cwd(), "public/images/langs")

    for (const lang of COURSE_ORDER) {
      const file = `${lang}.png`
      const filePath = path.join(baseDir, file)

      if (!fs.existsSync(filePath)) {
        console.warn(`File not found, skipping: ${file}`)
        continue
      }

      const title = lang.charAt(0).toUpperCase() + lang.slice(1)
      const langCode = langCodes[lang] || "en-US"
      const buffer = fs.readFileSync(filePath)
      const fileObj = new File([buffer], file, { type: "image/png" })

      console.log(`Processing ${title}...`)

      // 1. Upload to storage
      const { data: uploadData, error: uploadError } = await insforge.storage
        .from(bucketName)
        .upload(file, fileObj)

      if (uploadError || !uploadData) {
        console.error(`Upload error for ${title}:`, uploadError?.message)
        continue
      }

      // 2. Insert into DB
      const { error: dbError } = await insforge.database
        .from("courses")
        .insert([{
          title,
          lang: langCode,
          image_src: uploadData.url,
          image_key: uploadData.key,
        }])

      if (dbError) {
        console.error(`DB error for ${title}:`, dbError.message)
      } else {
        console.log(`Seeded: ${title}`)
      }
    }

    console.log("Done seeding all courses.")
  } catch (error) {
    console.error("Global seeding error:", error)
  }
}

if (process.argv[1]?.endsWith("seed-courses.ts")) {
  seedCourses()
}

// npx tsx scripts/seed-courses.ts
