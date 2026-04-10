import React from 'react';
import { redirect } from 'next/navigation';
import { getUserProgress } from '@/app/action/course';
import { FeedLevels } from './_common/feed-levels';
import { StickyBar } from '../_common/sticky-bar';

export default async function LearnPage() {
  const userProgress = await getUserProgress();

  if (!userProgress || !userProgress.active_course_id) {
    redirect("/courses");
  }

  return (

    <div className="w-full pt-4">
      <div className="w-full max-w-[1056px] mx-auto flex flex-row-reverse items-start gap-[18px] p-8">
        <StickyBar />
        <FeedLevels />
      </div>
    </div>
  );
}

