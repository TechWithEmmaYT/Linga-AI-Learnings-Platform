"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getLeaderboard } from "@/app/action/course";
import { Trophy, Zap } from "lucide-react";
import { Card } from "@/components/ui/custom/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/custom/button";
import { RankIcon, AvatarUser } from "@/components/leaderboard";
import { cn } from "@/lib/utils";

export const Leaderboard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["leaderboard-top-5"],
    queryFn: () => getLeaderboard(5),
  });

  const users = data?.leaderboard ?? [];
  const showFooter = (users?.length ?? 0) > 1

  return (
    <Card className="px-0 overflow-hidden shadow-sm border-2">
      <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-neutral-50/50 dark:bg-background">
        <div className="flex items-center gap-x-2">
          <Trophy className="h-5 w-5 text-primary" />
          <span className="text-sm font-extrabold uppercase tracking-wide text-neutral-600 dark:text-white">
            Leaderboard
          </span>
        </div>
        <Link
          href="/leaderboard"
          className="text-xs font-bold text-primary hover:underline"
        >
          See all
        </Link>
      </div>

      <div className="flex flex-col divide-y divide-border">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-x-3 px-4 py-3">
              <Skeleton className="h-4 w-4 rounded-sm" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 flex-1 rounded-sm" />
              <Skeleton className="h-4 w-12 rounded-sm" />
            </div>
          ))
        ) : (
          users.map((user: any, i: number) => (
            <div
              key={user.user_id}
              className={cn(
                "flex items-center gap-x-3 px-4 py-3 transition-colors",
                user.isCurrentUser && "bg-primary/5 text-primary"
              )}
            >
              <RankIcon rank={i + 1} points={user.points} />
              <AvatarUser name={user.name || "User"} isCurrentUser={user.isCurrentUser} />
              <span className="text-sm font-bold flex-1 truncate">
                {user.isCurrentUser ? "You" : user.name}
              </span>
              <div className="flex items-center gap-x-1">
                <Zap className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-bold text-neutral-600">
                  {user.points}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {showFooter && !isLoading && (
        <div className="px-4 py-3">
          <Button variant="outline" size="lg" className="w-full font-bold" asChild>
            <Link href="/leaderboard">
              See more
            </Link>
          </Button>
        </div>
      )}
    </Card>
  );
};
