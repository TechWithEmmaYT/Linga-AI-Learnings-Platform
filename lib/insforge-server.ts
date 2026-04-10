import "server-only"
import { createClient, type InsForgeClient } from "@insforge/sdk";

export function createInsforgeServerClient(accessToken?: string): InsForgeClient {
  return createClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
    anonKey: process.env.INSFORGE_ANON_KEY!,
    isServerMode: true,
    edgeFunctionToken: accessToken
  })
}
