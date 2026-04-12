import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentLevel } from '@/app/action/course';
import VoiceSession from './voice-session';

export default async function LevelPage() {
  const levelData = await getCurrentLevel();

  if (!levelData) {
    redirect("/learn");
  }

  return (
    <VoiceSession
      level={levelData.level}
      language={levelData.language}
      lang={levelData.lang}
      sessionId={levelData.sessionId}
      userId={levelData.userId}
    />
  );
}

