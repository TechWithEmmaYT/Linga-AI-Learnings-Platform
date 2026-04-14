"use client";

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCurrentCourse } from '@/app/action/course';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { LevelButton } from './level-button';
import { SuperModal } from './super-modal';

const getDifficulty = (levelNumber: number) => {
  if (levelNumber <= 3) return "Beginner";
  if (levelNumber <= 7) return "Intermediate";
  return "Advanced";
};

export const FeedLevels = () => {
  const [isProModalOpen, setIsProModalOpen] = useState(false);

  const { data: courseData, isLoading } = useQuery({
    queryKey: ["currentCourse"],
    queryFn: async () => await getCurrentCourse()
  });

  const levels = courseData?.levels ?? [];
  const course = courseData?.course;

  const currentLevel = levels.find((l: any) => l.current)
  const difficulty = getDifficulty(currentLevel?.level_number)
  return (
    <div className="relative flex-1 pt-1 pb-10">



      <div className="relative flex w-full items-center justify-between rounded-2xl bg-primary p-5 text-primary-foreground shadow-sm border-black/10 transition-all">

        <div className="flex flex-col gap-y-1.5">
          <div className="flex items-center gap-x-6">
            {isLoading ? (
              <Skeleton className="h-4 w-24 bg-white/20 rounded-lg" />
            ) : (
              <>
                <Link href="/courses">
                  <Button size="icon" variant="ghost" className="text-white! hover:bg-white/20">
                    <ArrowLeft className="h-5 w-5 mr-2" />
                  </Button>
                </Link>
                <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  {`${difficulty} · Level ${currentLevel?.level_number ?? 1} - ${levels.length}`}
                </div>
              </>
            )}
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-40 bg-white/20 rounded-lg" />
          ) : (
            <div className="flex items-center gap-x-4">
              {course?.image_src && (
                <div className="bg-white p-1 rounded-lg">
                  <Image
                    src={course.image_src}
                    alt={course.title}
                    height={30}
                    width={30}
                    className="rounded-md object-cover"
                  />
                </div>
              )}
              <h1 className="text-2xl font-bold">{course?.title}</h1>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center relative pt-5">

        {isLoading ? (
          Array.from({ length: 10 }).map((_, index) => (
            <LevelButton
              key={index}
              index={index}
              isLoading={isLoading}
              totalCount={9}
            />
          ))
        ) : (
          levels.map((level: any, index: number) => {
            return (
              <LevelButton
                key={level.id}
                {...level}
                index={index}
                totalCount={levels.length}
                onProModalOpen={setIsProModalOpen}
              />
            );
          })

        )}
      </div>

      <SuperModal
        isOpen={isProModalOpen}
        onOpenChange={setIsProModalOpen}
      />
    </div>
  );
};
