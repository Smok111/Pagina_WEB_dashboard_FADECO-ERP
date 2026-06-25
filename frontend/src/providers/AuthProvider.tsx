"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
}

interface Session {
  user: User;
  token: string;
}

interface AuthContextType {
  data: Session | null;
  status: "loading" | "authenticated" | "unauthenticated";
  signIn: (email: string, pass: string) => Promise<{ error?: string; ok: boolean }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<Session | null>(null);
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const userStr = localStorage.getItem("auth_user");
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setData({ user, token });
        setStatus("authenticated");
      } catch (e) {
        setStatus("unauthenticated");
      }
    } else {
      setStatus("unauthenticated");
    }
  }, []);

  const signIn = async (email: string, pass: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass }),
      });
      
      const body = await res.json();
      
      if (!res.ok) {
        return { ok: false, error: body.message || "Error de autenticación" };
      }

      localStorage.setItem("auth_token", body.access_token);
      localStorage.setItem("auth_user", JSON.stringify(body.user));
      document.cookie = `auth_token=${body.access_token}; path=/`;
      
      setData({ user: body.user, token: body.access_token });
      setStatus("authenticated");
      
      return { ok: true };
    } catch (error) {
      console.error("Login fetch error:", error);
      return { ok: false, error: "Error de red" };
    }
  };

  const signOut = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setData(null);
    setStatus("unauthenticated");
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ data, status, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useSession() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useSession must be used within an AuthProvider");
  }
  return { data: context.data, status: context.status };
}

export function useAuthActions() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthActions must be used within an AuthProvider");
  }
  return { signIn: context.signIn, signOut: context.signOut };
}
