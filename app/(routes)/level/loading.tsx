"use client";

import React from 'react';
import Image from 'next/image';
import { Spinner } from '@/components/ui/spinner';

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50">
      {/* Pulse background effect for logo */}
      <div className="relative size-40 flex items-center justify-center">
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse group-hover:bg-primary/30 transition-all duration-500" />

        <div className="relative size-32 animate-bounce">
          <Image
            src="/images/logo-teacher.png"
            alt="Teacher"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      <div className="mt-12 text-center space-y-4">
        <h2 className="text-3xl font-black bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Preparing your session...
        </h2>
        <p className="text-muted-foreground italic max-w-sm px-8 leading-relaxed">
          &quot;The best way to learn a language is to speak it from day one.&quot;
        </p>
      </div>

      <div className="fixed bottom-12 flex flex-col items-center gap-y-3">
        <Spinner className="h-6 w-6 text-primary" />
        <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60 animate-pulse">
          Initializing
        </p>
      </div>
    </div>
  );
}
