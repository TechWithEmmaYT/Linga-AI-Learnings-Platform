import React from 'react';
import Image from 'next/image';
import { Trophy } from 'lucide-react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { Button } from '@/components/ui/custom/button';
import { MIN_PASSING_SCORE } from '@/lib/constants';

type Props = {
  levelNumber?: number;
  language?: string;
  score: number;
  totalExercises: number;
  onContinue: () => void;
};

const LevelComplete = ({
  score,
  totalExercises,
  onContinue,
}: Props) => {
  const { width, height } = useWindowSize();
  const passed = score >= MIN_PASSING_SCORE;

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background text-center px-6">
      {passed && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.1}
        />
      )}

      <div className="flex flex-col items-center gap-y-6 max-w-sm">
        <div className="relative">
          {passed ? (
            <Trophy className="h-24 w-24 text-yellow-500 drop-shadow-lg" />
          ) : (
            <Image
              src="/images/logo-2.png"
              alt="Level Incomplete"
              width={100}
              height={100}
              className="object-contain"
            />
          )}
        </div>

        <div className="space-y-2">
          <h1 className={`text-4xl font-black uppercase tracking-tight ${passed ? "text-primary" : "text-rose-500"
            }`}>
            {passed ? "Level Complete!" : "Level Incomplete"}
          </h1>
          <p className="text-2xl font-bold text-neutral-600">
            {score}/{totalExercises} correct {passed && "🎉"}
          </p>
        </div>

        {!passed && (
          <div className="space-y-1">
            <p className="text-muted-foreground font-medium">
              You need {MIN_PASSING_SCORE} correct to pass this level.
            </p>
            <p className="text-lg font-bold text-neutral-800">
              Don&apos;t give up! Keep practicing.
            </p>
          </div>
        )}

        <div className="w-full pt-4">
          <Button
            onClick={onContinue}
            variant={passed ? "default" : "outline"}
            size="lg"
            className="w-full h-14 text-lg font-bold uppercase tracking-widest border-b-4 active:border-b-0"
          >
            {passed ? "Continue" : "Try Again"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LevelComplete;

