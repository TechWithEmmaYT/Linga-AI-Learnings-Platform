"use client"
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/custom/button";
import { Spinner } from "@/components/ui/spinner";
import Image from "next/image"
import Link from "next/link";

export default function Home() {
  const { isLoaded, isSignedIn } = useAuth()
  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-center gap-2">
      <div className="relative w-[380px] h-[380px] lg:w-[500px] lg:h-[500px] shrink-0">

        <Image
          src="/images/illustration.png"
          alt="Hero"
          fill
          className="object-contain lg:-mt-4"
          priority
        />
      </div>

      <div className="flex flex-col items-center gap-y-8 px-4">
        <h1 className="text-center text-xl font-semibold
        text-[#4b4b4b] dark:text-white lg:text-3xl
        ">
          The fun, effective, AI-powered way to learn languages.
        </h1>
        <div className="flex flex-col items-center gap-y-3 w-full max-w-[330px]">
          {!isLoaded ? (
            <Spinner className="size-8" />
          ) : isSignedIn ? (
            <Button size="lg" variant="outline" asChild>
              <Link href="/learn">
                Continue Learning
              </Link>
            </Button>
          ) : (
            <>
              <Button size="lg" className="w-full" asChild>
                <Link href="/auth/sign-up">
                  Get Started
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full" asChild>
                <Link href="/auth/sign-in">
                  I already have an account
                </Link>
              </Button>

            </>
          )}


        </div>
      </div>
    </div>
  );
}
