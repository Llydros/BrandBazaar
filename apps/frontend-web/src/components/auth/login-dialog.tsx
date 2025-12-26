"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";

interface LoginDialogProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function LoginDialog({ children, open: controlledOpen, onOpenChange }: LoginDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { login, register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (isLogin) {
        const user = await login(email, password);
        if (user.roles.includes("admin")) {
          router.push("/admin");
        }
      } else {
        await register(email, password);
      }
      setIsOpen(false);
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setEmail("");
    setPassword("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="uppercase tracking-widest">{isLogin ? "Login" : "Register"}</DialogTitle>
          <DialogDescription className="uppercase text-xs tracking-wider">
            {isLogin
              ? "Enter your credentials to access your account."
              : "Join us to get started."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              minLength={6}
            />
          </div>
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 border border-destructive">
              {error}
            </div>
          )}
          <div className="flex flex-col space-y-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-none bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isLoading ? "Loading..." : isLogin ? "LOGIN" : "REGISTER"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={toggleMode}
              className="w-full rounded-none"
            >
              {isLogin
                ? "CREATE ACCOUNT"
                : "ALREADY HAVE AN ACCOUNT?"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
