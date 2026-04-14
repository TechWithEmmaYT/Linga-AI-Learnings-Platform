"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { startLevelSession } from '@/app/action/course';
import { Check, Crown, Star } from 'lucide-react';
import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Button } from '@/components/ui/custom/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { LevelPopover } from './level-popover';
import { toast } from 'sonner';

interface LevelButtonProps {
  id?: string;
  index?: number;
  totalCount?: number;
  levelNumber?: number;
  title?: string;
  purpose?: string;
  locked?: boolean;
  isProLocked?: boolean;
  current?: boolean;
  percentage?: number;
  isLoading?: boolean;
  onProModalOpen?: (open: boolean) => void;
}

const getDifficulty = (levelNumber: number) => {
  if (levelNumber <= 3) return "Beginner";
  if (levelNumber <= 7) return "Intermediate";
  return "Advanced";
};

export const LevelButton = ({
  id,
  index = 0,
  totalCount = 0,
  levelNumber = 1,
  title,
  purpose,
  locked,
  isProLocked,
  current,
  percentage = 0,
  isLoading,
  onProModalOpen,
}: LevelButtonProps) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: () => startLevelSession(id!),
    onSuccess: (data: any) => {
      if (data?.error === "UPGRADE_REQUIRED") {
        onProModalOpen?.(true);
        return;
      }
      router.push("/level");
    },
    onError: () => {
      toast.error("Something went wrong.");
    }
  })
  const handleStartClick = () => {
    if (locked || isPending) return
    mutate()
  }

  const handleOpenChange = (open: boolean) => {
    if (isProLocked) {
      onProModalOpen?.(true)
      return
    }
    setIsOpen(open)
  }




  const cycleIndex = index % 8;
  let indentation = 0;

  if (cycleIndex <= 2) {
    indentation = cycleIndex * 40;
  } else if (cycleIndex <= 4) {
    indentation = (4 - cycleIndex) * 40;
  } else if (cycleIndex <= 6) {
    indentation = (cycleIndex - 4) * -40;
  } else {
    indentation = (index % 8 - 8) * 40;
  }

  const isFirst = index === 0;
  const isLast = index === totalCount - 1;
  const difficulty = getDifficulty(levelNumber);

  const isCompleted = !!id && !current && !locked;

  const getIcon = () => {
    if (isProLocked) return Crown; // Or Gem
    if (isCompleted) return Check;
    return Star;
  };

  const Icon = getIcon();

  if (isLoading || !id) {
    return (
      <div
        className="relative flex flex-col items-center
            justify-center animate-pulse"
        style={{
          marginLeft: `${indentation}px`,
          marginTop: index === 0 && !isCompleted ? 60 : 24

        }}
      >
        <Skeleton className="h-[70px] w-[70px] rounded-full
        bg-neutral-300 dark:bg-neutral-700
          rounded-full border-b-8 border-neutral-400 dark:border-neutral-600
        " />
      </div>
    );
  }

  return (
    <div
      role="button"
      className="cursor-pointer relative z-10"
      style={{
        marginLeft: `${indentation}px`,
        marginBottom: isLast ? '40px' : '0'
      }}
    >
      <LevelPopover
        title={title}
        purpose={purpose}
        difficulty={difficulty}
        isProLocked={isProLocked}
        locked={locked && !current}
        current={current}
        isCompleted={isCompleted}
        onClick={handleStartClick}
        onOpenChange={handleOpenChange}
        isOpen={isOpen}
        isPending={isPending}
      >
        <div className="relative h-[102px] w-[102px] flex items-center justify-center">
          {current ? (
            <div className="h-[102px] w-[102px] relative">
              {!isOpen && (
                <div className="absolute -top-12 left-1/2 z-10 -translate-x-1/2 animate-bounce
                rounded-xl border-2 border-b-4 border-border bg-white dark:bg-neutral-900
                px-4 py-2 font-bold uppercase tracking-wide text-primary flex justify-center items-center">
                  Start
                  <div className="absolute -bottom-1.5 left-1/2 size-3 -translate-x-1/2
                rotate-45 border-b-2 border-r-2 border-border
                    bg-white dark:bg-neutral-900" />
                </div>
              )}
              <CircularProgressbarWithChildren
                value={percentage}
                styles={buildStyles({
                  pathColor: "var(--color-primary)",
                  trailColor: "#e5e7eb",
                })}
              >
                <Button
                  variant={locked ? "secondary" : "default"}
                  className="h-[70px] w-[70px] border-b-9
                  pointer-events-none rounded-full
                  "
                >
                  <Icon className="size-10 fill-white  text-white" />
                </Button>
              </CircularProgressbarWithChildren>
            </div>
          ) : (
            <Button variant={isCompleted ?
              "default" : locked ? "locked" : "secondary"}
              className={cn(`relative h-[70px] w-[70px]
                        border-b-9 pointer-events-none rounded-full`,
              )}>
              <Icon className={cn(
                "size-10",
                isCompleted ? "fill-primary stroke-[4]"
                  : locked
                    ? "fill-neutral-400 stroke-neutral-400 text-neutral-400"
                    : "fill-primary-foreground text-primary-foreground",
              )} />
              {isProLocked && (
                <div className="absolute -top-px left-1/2 -translate-x-1/2">
                  <Image
                    src="/images/super-logo.svg" alt="Super"
                    className="shadow-[0_4px_14px_rgba(160,92,255,0.45)] backdrop-blur-sm transform scale-135"
                    width={70} height={20} />
                </div>

              )}
            </Button>
          )}
        </div>
      </LevelPopover>
    </div>
  );
};
