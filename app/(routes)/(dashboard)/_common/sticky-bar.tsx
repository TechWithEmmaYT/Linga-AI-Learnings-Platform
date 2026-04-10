"use client";

import { usePathname } from "next/navigation";
import { useQueries } from "@tanstack/react-query";
import { getUserSubscription } from "@/app/action/subscription";
import { getXPStats } from "@/app/action/course";
import { Zap, Trophy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/custom/card";

import { Upgrade } from "./upgrade";

import { Leaderboard } from "./leaderboard";

export function StickyBar() {
  const pathname = usePathname();
  const isLeaderboardPage = pathname === "/leaderboard";

  const results = useQueries({
    queries: [
      {
        queryKey: ["subscription"],
        queryFn: () => getUserSubscription(),
      },
      {
        queryKey: ["xp-stats"],
        queryFn: () => getXPStats(),
      },
    ],
  });

  const [subscriptionQuery, xpStatsQuery] = results;

  const isPro = subscriptionQuery.data?.isPro;
  const points = xpStatsQuery.data?.points;
  const weeklyPoints = xpStatsQuery.data?.weeklyPoints;

  const isLoading = subscriptionQuery.isLoading || xpStatsQuery.isLoading;

  return (
    <div className="hidden lg:block sticky top-3 pt-2 w-full max-w-sm px-6">
      <div className="flex flex-col gap-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 flex flex-col gap-y-2">
            <div className="flex items-center gap-x-2">
              <Zap className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <p className="font-bold text-neutral-600 uppercase text-xs">Total XP</p>
            </div>
            {isLoading ? (
              <Skeleton className="h-6 w-16" />
            ) : (
              <p className="text-2xl font-bold">{points ?? 0}</p>
            )}
          </Card>

          <Card className="p-4 flex flex-col gap-y-2">
            <div className="flex items-center gap-x-2">
              <Trophy className="h-5 w-5 text-primary fill-primary/10" />
              <p className="font-bold text-neutral-600 uppercase text-xs">This Week</p>
            </div>
            {isLoading ? (
              <Skeleton className="h-6 w-16" />
            ) : (
              <p className="text-2xl font-bold">{weeklyPoints ?? 0}</p>
            )}
          </Card>
        </div>

        {!isPro && !isLoading && <Upgrade />}
        {!isLeaderboardPage && <Leaderboard />}
      </div>
    </div>
  );
}
