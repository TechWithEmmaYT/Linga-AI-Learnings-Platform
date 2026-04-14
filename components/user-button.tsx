"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/components/auth-provider";

export function UserButton() {
  const { user, signOut, isLoaded, isFetching  } = useAuth();
  // const router = useRouter();

   if (!isLoaded || isFetching) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
      </div>
    );
  }

  if (!user) return null;

  

  const handleSignOut = async () => {
    await signOut();
  };

  const name = user.profile?.name;
  const email = user.email || "";

  let initials = "?";
  if (name) {
    initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  } else if (email) {
    initials = email.charAt(0).toUpperCase();
  }

  const userName = name || email.slice(0, 10);
  const userEmail = email;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
          role="button"
          className="flex items-center gap-x-2 rounded-full outline-none hover:bg-muted/50 p-1 pr-3 lg:pr-3 md:pr-3 sm:pr-1 transition"
        >
          <Avatar className="h-8 w-8 ring-2 ring-primary/20">
            <AvatarImage src="/images/profile.svg" />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="hidden flex-col items-start md:flex">
            <span className="text-sm font-medium leading-none">{userName}</span>
            <span className="text-xs text-muted-foreground">{userEmail}</span>
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="flex flex-col">
          <span>{userName}</span>
          <span className="text-xs font-normal text-muted-foreground">
            {userEmail}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="text-red-500 cursor-pointer focus:bg-red-500/10 focus:text-red-500"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
