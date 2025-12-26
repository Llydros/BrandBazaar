"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User } from "@shared/auth";
import { api } from "@/lib/api";
import { useRouter, usePathname } from "next/navigation";
import { useHeartbeat } from "@/hooks/use-heartbeat";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useHeartbeat(!!user);

  useEffect(() => {
    if (
      !isLoading &&
      user?.roles.includes("admin") &&
      !pathname.startsWith("/admin")
    ) {
      router.push("/admin");
    }
  }, [user, isLoading, pathname, router]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await api.auth.getMe();
        setUser(data.user);
      } catch (error) {
        console.log("Auth check failed:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(checkAuth, 100);
    return () => clearTimeout(timeoutId);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await api.auth.login({ email, password });
      setUser(data.user);
      return data.user;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const data = await api.auth.register({ email, password });
      setUser(data.user);
      return data.user;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
    }
  };

  const refreshAuth = async () => {
    try {
      const data = await api.auth.getMe();
      setUser(data.user);
    } catch (error) {
      console.log("Auth refresh failed:", error);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, refreshAuth, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
