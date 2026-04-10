"use server"

import { getInsforgeServerClient } from "./auth";
import { asyncHandler } from "./async-handler";
import { revalidatePath } from "next/cache";
import { getUserSubscription } from "./subscription";
import { FREE_LEVELS, TOTAL_EXERCISES, XP_EARN_PER_CORRECT } from "@/lib/constants";

export async function getAllCourses() {
  return asyncHandler(async () => {
    const { insforge, userId } = await getInsforgeServerClient();
    const [userProgressRes, coursesRes] = await Promise.all([
      insforge.database
        .from("user_progress")
        .select("active_course_id")
        .eq("user_id", userId)
        .single(),
      insforge.database
        .from("courses")
        .select("*")
    ]);
    const activeCourseId = userProgressRes.data?.active_course_id;
    const courses = coursesRes.data || [];

    const mappedCourses = courses.map((course: any) => ({
      ...course,
      isActive: course.id === activeCourseId
    }));
    revalidatePath("/courses");

    return mappedCourses;
  }, { fallbackError: [] });
}
export async function upsertUserProgress(courseId: string) {
  return asyncHandler(async () => {
    const { insforge, userId } = await getInsforgeServerClient();

    const { data, error } = await insforge.database
      .from("user_progress")
      .upsert(
        {
          user_id: userId,
          active_course_id: courseId
        },
        { onConflict: "user_id" }
      )
      .select()
      .single();

    if (error) throw error;

    return data;
  });
}

export async function getUserProgress() {
  return asyncHandler(async () => {
    const { insforge, userId } = await getInsforgeServerClient();

    const { data, error } = await insforge.database
      .from("user_progress")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    return data || null;
  }, { fallbackError: null });
}

export async function getCurrentCourse() {
  return asyncHandler(async () => {
    const { insforge, userId } = await getInsforgeServerClient();

    const userProgress = await getUserProgress();
    if (!userProgress || !userProgress.active_course_id) {
      return null;
    }

    const [courseRes, levelsRes, progressRes, subscription] = await Promise.all([
      insforge.database
        .from("courses")
        .select("*")
        .eq("id", userProgress.active_course_id)
        .single(),
      insforge.database
        .from("levels")
        .select("*")
        .eq("course_id", userProgress.active_course_id)
        .order("level_number", { ascending: true }),
      insforge.database
        .from("level_progress")
        .select("*")
        .eq("user_id", userId),
      getUserSubscription()
    ]);

    const course = courseRes.data;
    const levels = levelsRes.data || [];
    const progressRecords = progressRes.data || [];
    const isPro = subscription?.isPro || false;

    let prevLevelWasCompleted = true;
    const levelsWithProgress = levels.map((level: any) => {
      const progress = progressRecords.find((p: any) => p.level_id === level.id);
      const completed = progress?.completed || false;
      const isProLocked = !isPro && level.level_number > FREE_LEVELS;

      const current = !completed && prevLevelWasCompleted && !isProLocked;
      const locked = !completed && !current;

      const mappedLevel = {
        ...level,
        completed,
        current,
        locked,
        isProLocked,
        percentage: Math.min(Math.round(((progress?.score || 0) / TOTAL_EXERCISES) * 100), 100),
      };

      prevLevelWasCompleted = completed;
      return mappedLevel;
    });

    return {
      course,
      progress: userProgress,
      levels: levelsWithProgress,
      isPro
    };
  }, { fallbackError: null });
}
export async function startLevelSession(levelId: string) {
  return asyncHandler(async () => {
    const { insforge, userId } = await getInsforgeServerClient();
    const subscription = await getUserSubscription();

    if (!subscription?.isPro) {
      const { data: existingSession } = await insforge.database
        .from("voice_sessions")
        .select("id")
        .eq("user_id", userId)
        .eq("level_id", levelId)
        .maybeSingle();

      if (existingSession) {
        throw new Error("UPGRADE_REQUIRED");
      }
    }

    const [sessionRes] = await Promise.all([
      insforge.database
        .from("voice_sessions")
        .insert({
          user_id: userId,
          level_id: levelId,
          status: "active",
          completed: false,
        })
        .select("id")
        .single(),
      insforge.database
        .from("user_progress")
        .update({ active_level_id: levelId })
        .eq("user_id", userId),
      insforge.database
        .from("level_progress")
        .upsert(
          {
            user_id: userId,
            level_id: levelId,
            completed: false,
          },
          { onConflict: "user_id,level_id" }
        ),
    ]);

    if (sessionRes.error) throw sessionRes.error;

    return { sessionId: sessionRes.data.id };
  });
}

export async function getXPStats() {
  return asyncHandler(async () => {
    const { insforge, userId } = await getInsforgeServerClient();

    // Start of week (Monday at midnight)
    const now = new Date();
    const day = now.getDay(); // 0 (Sun) to 6 (Sat)
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(now.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);

    const [userProgress, weeklySessions] = await Promise.all([
      insforge.database
        .from("user_progress")
        .select("points")
        .eq("user_id", userId)
        .single(),
      insforge.database
        .from("voice_sessions")
        .select("score")
        .eq("user_id", userId)
        .gte("created_at", startOfWeek.toISOString()),
    ]);

    const points = userProgress.data?.points || 0;
    const weeklyPoints = (weeklySessions.data || []).reduce(
      (acc: number, session: any) => acc + (session.score || 0) * XP_EARN_PER_CORRECT,
      0
    );

    return {
      points,
      weeklyPoints
    };
  }, { fallbackError: { points: 0, weeklyPoints: 0 } });
}

export async function getLeaderboard(limit = 10) {
  return asyncHandler(async () => {
    const { insforge, userId } = await getInsforgeServerClient();

    const { data, error } = await insforge.database
      .from("leaderboard_view")
      .select("*")
      .order("rank", { ascending: true })
      .limit(limit);

    if (error) throw error;

    const leaderboard = (data || []).map((row: any) => ({
      ...row,
      isCurrentUser: row.user_id === userId
    }));

    const currentUserData = leaderboard.find((row: any) => row.user_id === userId);

    // If user is not in top 10, we might need to fetch their specific rank/points
    let userPoints = currentUserData?.points || 0;
    let userRank = currentUserData?.rank || 0;

    if (!currentUserData) {
      const { data: userProgress } = await insforge.database
        .from("leaderboard_view")
        .select("points, rank")
        .eq("user_id", userId)
        .maybeSingle();

      userPoints = userProgress?.points || 0;
      userRank = userProgress?.rank || 0;
    }

    return {
      leaderboard,
      userPoints,
      userRank
    };
  });
}


