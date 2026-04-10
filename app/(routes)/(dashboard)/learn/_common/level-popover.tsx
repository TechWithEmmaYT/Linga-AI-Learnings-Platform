"use client";

import React from 'react';
import {
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/custom/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { XP_TOTAL_COMPLETE, XP_EARN_PER_CORRECT } from '@/lib/constants';

interface LevelPopoverProps {
  title?: string;
  purpose?: string;
  difficulty?: string;
  locked?: boolean;
  isProLocked?: boolean;
  isCompleted?: boolean;
  current?: boolean;
  onClick?: () => void;
  isPending?: boolean;
  children: React.ReactNode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LevelPopover = ({
  title,
  purpose,
  locked,
  isProLocked,
  isCompleted,
  current,
  isOpen,
  onOpenChange,
  onClick,
  isPending,
  children,
}: LevelPopoverProps) => {
  const getButtonText = () => {
    if (isPending) return <Spinner className="h-4 w-4" />;
    if (isProLocked && !current) return "Upgrade to Pro";
    if (locked && !current) return "Locked";
    if (isCompleted) return `Retake +${XP_TOTAL_COMPLETE} XP`;
    return `Start +${XP_TOTAL_COMPLETE} XP`
  }


  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>

      <PopoverContent
        className={cn(
          "p-4 border-2 shadow-sm rounded-2xl flex flex-col relative w-[260px]",
          locked
            ? "bg-neutral-200 border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700"
            : "bg-primary border-primary",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=open]:zoom-in-75 data-[state=closed]:zoom-out-0",
          "duration-200 ease-out",
        )}
      >
        <h3 className={cn("text-lg font-bold mb-1",
          locked ? "text-neutral-400 dark:text-neutral-500" : "text-white"
        )}>
          {title}
        </h3>
        <p className={cn("text-base mb-2 font-semibold",
          locked ? "text-neutral-400 dark:text-neutral-500" : "text-white/90"
        )}>
          {locked ? "Complete all levels above to unlock this!" : purpose}
        </p>
        {!locked && (
          <p className={cn("text-base mb-3",
            locked ? "text-neutral-400 dark:text-neutral-500" : "text-white/90")}>
            Earn <span className="font-bold">+{XP_EARN_PER_CORRECT} XP</span> per correct answer
          </p>
        )}

        {locked ? (
          <div className="w-full flex items-center justify-center
        h-12 rounded-xl bg-neutral-300 dark:bg-neutral-700
        text-neutral-400 dark:text-neutral-500
        font-bold uppercase tracking-wider text-sm select-none">
            Locked
          </div>
        ) : (
          <Button
            onClick={onClick}
            disabled={isPending}
            size="lg"
            className="w-full bg-white! text-primary! border-white/80
                        flex items-center justify-center transition-all"
          >
            {isPending && <Spinner />}
            {getButtonText()}
          </Button>
        )}
        <PopoverArrow className={cn("w-6 h-3", locked
          ? "fill-neutral-200 dark:fill-neutral-800"
          : "fill-primary")} />
      </PopoverContent>
    </Popover>
  );
};
