"use client";
import { getCurrentUser, signOutAction } from "@/app/action/auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createContext, useContext } from "react";

type User = {
  id: string;
  email?: string;
  profile: {
    name?: string;
  } | null
};

interface AuthContextType {
  user: User | null;
  isLoaded: boolean;
  isFetching: boolean;
  isSignedIn: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => void;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined)


export function AuthProvider({ children }: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: user = null, isLoading, isFetching } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const result = await getCurrentUser();
      return result.user
    }
  })

  const signOut = async () => {
    try {
      await signOutAction();
    } catch (error) {
      console.log("Sign out", error);
    }
    queryClient.setQueryData(["user"], null)
    router.push("/auth/sign-in")
  }

  const refreshUser = () => {
    queryClient.invalidateQueries({
      queryKey: ["user"]
    })

  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoaded: !isLoading,
        isSignedIn: !!user,
        isFetching,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
