"use client"
import Logo from './logo'
import { DarkModeToggle } from './dark-mode'
import { Button } from './ui/custom/button'
import { useAuth } from './auth-provider'
import { cn } from '@/lib/utils'
import { Spinner } from './ui/spinner'
import { UserButton } from './user-button'
import Link from 'next/link'

const Header = () => {
  const { isLoaded, isSignedIn } = useAuth()

  if (!isLoaded) {
    return (
      <header className={cn("h-16 w-full border-b-2 border-border px-4")}>
        <div className="mx-auto flex h-full items-center justify-between lg:max-w-screen-lg">
          <Logo />
          <Spinner className="size-5" />
        </div>
      </header>
    );
  }

  return (
    <header className="h-16 w-full border-b-2 border-border px-4">
      <div className="flex h-full items-center justify-between
      lg:max-w-5xl mx-auto
      ">
        <Logo />
        <div className="flex gap-x-3 items-center">
          <DarkModeToggle />
          {isSignedIn ? (
            <UserButton />
          ) : (
            <>
              <>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/auth/sign-in">
                    Login
                  </Link>
                </Button>
                <Button size="sm" variant="default" asChild>
                  <Link href="/auth/sign-up">

                    Sign Up
                  </Link>
                </Button>
              </>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
