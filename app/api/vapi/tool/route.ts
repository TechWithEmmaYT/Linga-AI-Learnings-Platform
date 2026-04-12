import { createClient } from "@insforge/sdk";
import { NextResponse } from "next/server";
import { XP_EARN_PER_CORRECT, MIN_PASSING_SCORE } from "@/lib/constants";

const insforge = createClient({
  baseUrl: process.env.NEXT_PUBLIC_INSFORGE_BASE_URL!,
  anonKey: process.env.INSFORGE_ANON_KEY!,
});

async function addXP(userId: string, amount: number) {
  try {
    const { data: progress } = await insforge.database
      .from("user_progress")
      .select("points")
      .eq("user_id", userId)
      .single();

    const currentPoints = progress?.points || 0;

    await insforge.database
      .from("user_progress")
      .update({ points: currentPoints + amount })
      .eq("user_id", userId);
  } catch (error) {
    console.error("Error adding XP:", error);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Vapi Tool Call Body:", JSON.stringify(body, null, 2));

    const callObject = body.message?.call || body.call;
    const metadata = callObject?.assistantOverrides?.metadata || callObject?.metadata || {};

    const { userId, sessionId, levelId } = metadata;
    const toolCallList = body.message?.toolCallList || body.toolCallList || [];

    if (toolCallList.length === 0) {
      return NextResponse.json({ results: [] });
    }

    const results = await Promise.all(
      toolCallList.map(async (toolCall: any) => {
        const { id: toolCallId, function: fn } = toolCall;
        const toolName = fn?.name;
        const args = typeof fn?.arguments === "string" ? JSON.parse(fn.arguments) : fn?.arguments || {};

        if (toolName === "markCorrect") {
          if (userId) {
            await addXP(userId, XP_EARN_PER_CORRECT);
          }
          return {
            toolCallId,
            result: JSON.stringify({
              isCorrect: true,
              pointsEarned: XP_EARN_PER_CORRECT,
            }),
          };
        }

        if (toolName === "completeLevel") {
          const finalScore = args.finalScore || 0;
          const passed = finalScore >= MIN_PASSING_SCORE;

          if (userId && levelId) {
            await Promise.all([
              insforge.database
                .from("level_progress")
                .upsert({
                  user_id: userId,
                  level_id: levelId,
                  completed: passed,
                  score: finalScore,
                }, { onConflict: "user_id,level_id" }),
              sessionId ? insforge.database
                .from("voice_sessions")
                .update({
                  status: "completed",
                  completed: passed,
                  score: finalScore
                })
                .eq("id", sessionId) : Promise.resolve(),
            ]);
          }


          return {
            toolCallId,
            result: JSON.stringify({
              score: finalScore,
              passed,
            }),
          };
        }

        return { toolCallId, result: "Tool not found" };
      })
    );

    console.log("Response payload:", JSON.stringify({ results }, null, 2));
    return NextResponse.json({ results });
  } catch (error: any) {
    console.error("Vapi Tool Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

