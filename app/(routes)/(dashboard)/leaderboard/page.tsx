"use client";
import { useQuery } from '@tanstack/react-query';
import { getLeaderboard } from '@/app/action/course';
import { StickyBar } from '../_common/sticky-bar';
import { Zap } from 'lucide-react';
import { AvatarUser, RankIcon } from '@/components/leaderboard';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Card } from '@/components/ui/custom/card';

const LeaderboardPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: () => getLeaderboard(),
  });

  const leaderboard = data?.leaderboard ?? [];
  const userRank = data?.userRank;
  const userPoints = data?.userPoints ?? 0;
  const currentUser = leaderboard?.find((u: any) => u.isCurrentUser)

  return (
    <div className="w-full pt-4">
      <div className="w-full max-w-[1056px] mx-auto flex flex-row-reverse items-start gap-[18px] p-8">
        <StickyBar />

        <div className="flex-1 flex flex-col items-center">
          <div className="relative mb-8 flex flex-col items-center gap-y-4">
            <Image src="/images/leaderboard.svg" alt="Leaderboard" height={90} width={90} />
            <div className="text-center">
              <h1 className="text-2xl font-bold text-neutral-800">Leaderboard</h1>
              <p className="text-muted-foreground">See where you stand among other learners.</p>
            </div>
          </div>

          <Separator className="mb-4 h-0.5 rounded-full" />

          {/* Your rank banner */}
          <Card className="w-full flex flex-row items-center gap-4 border-primary/30 bg-primary/5 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              {isLoading ? (
                <Skeleton className="size-6" />
              ) : (
                <span className="text-lg font-extrabold text-primary">#{userRank}</span>
              )}
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Your Rank</p>
              {isLoading ? (
                <Skeleton className="h-5 w-32 mt-1" />
              ) : (
                <p className="font-extrabold text-foreground">
                  {currentUser
                    ? `You're #${userRank} of ${leaderboard?.length}!`
                    : "Start learning to join!"}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Zap className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-bold text-sm">
                {isLoading ? <Skeleton className="h-4 w-10" /> : userPoints.toLocaleString()} XP
              </span>
            </div>
          </Card>

          <Card className="w-full p-0 ">
            <div className="divide-y divide-border">

              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="flex items-center w-full p-2 px-4 rounded-xl gap-x-4">
                    <Skeleton className="h-6 w-6" />
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <Skeleton className="h-6 flex-1" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))
              ) : leaderboard.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                  No rankings yet. Start learning to climb the leaderboard!
                </div>
              ) : (
                leaderboard?.map((user: any, i: number) => (
                  <div key={`${user.userId}-${i}`} className={cn(
                    "flex items-center gap-3 px-4 py-3 transition-colors",
                    user.isCurrentUser && "bg-primary/5"
                  )}>
                    <RankIcon rank={i + 1} points={user.points} />
                    <AvatarUser name={user.name} isCurrentUser={user.isCurrentUser} />
                    <span className={cn(
                      "flex-1 font-bold text-sm truncate",
                      user.isCurrentUser ? "text-primary" : "text-foreground"
                    )}>
                      {user.isCurrentUser ? `You` : user.name}
                    </span>
                    <div className="flex items-center gap-1">
                      <Zap className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-black">{user.points.toLocaleString()}</span>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">XP</span>
                    </div>
                  </div>
                ))
              )}


            </div>
          </Card>
        </div>
      </div >
    </div >
  );
};

export default LeaderboardPage;

