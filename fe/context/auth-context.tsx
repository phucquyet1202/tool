"use client";

import { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { GetUserByToken } from "@/api/user";

type AuthContextType = {
  user: any;
  isLoading: boolean;
  refetchUser: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const {
    data: user,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["user"],
    queryFn: GetUserByToken,
    staleTime: 1000 * 60 * 5, // 5 phút
  });

  return (
    <AuthContext.Provider value={{ user, isLoading, refetchUser: refetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
