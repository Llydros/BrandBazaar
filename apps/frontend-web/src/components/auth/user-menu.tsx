"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useWishlist } from "@/contexts/wishlist-context";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, Heart, Trophy, User, X } from "lucide-react";

interface UserMenuProps {
  showUsername?: boolean;
}

export function UserMenu({ showUsername = false }: UserMenuProps) {
  const { user, logout } = useAuth();
  const { totalItems } = useWishlist();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
    setIsOpen(false);
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center gap-3">
        {showUsername && (
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="text-sm font-mono uppercase tracking-wider text-foreground hidden sm:block hover:text-muted-foreground transition-colors cursor-pointer"
          >
            {user.email?.split("@")[0] ?? "User"}
          </button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="relative cursor-pointer"
          aria-label="Open user menu"
        >
          <User className="h-5 w-5" />
        </Button>
      </div>

      {isOpen && (
        <div className="absolute right-0 top-full mt-4 w-96 bg-background border rounded-none shadow-lg z-50 max-h-[80vh] flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold uppercase tracking-wider">
                  Account
                </h3>
                <p className="font-mono text-xs uppercase text-muted-foreground mt-1">
                  {user.email}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="space-y-2">
              {!user.roles.includes("admin") && (
                <>
                  <Link
                    href="/profile"
                    className="block"
                    onClick={() => setIsOpen(false)}
                  >
                    <Button
                      variant="outline"
                      className="w-full justify-start rounded-none h-12 uppercase tracking-wider"
                    >
                      <User className="w-4 h-4 mr-2 text-blue-500" />
                      My Profile
                    </Button>
                  </Link>
                  <Link
                    href="/wishlist"
                    className="block"
                    onClick={() => setIsOpen(false)}
                  >
                    <Button
                      variant="outline"
                      className="w-full justify-start rounded-none h-12 uppercase tracking-wider"
                    >
                      <Heart className="w-4 h-4 mr-2 text-red-500" />
                      Wishlist
                      {totalItems > 0 && (
                        <span className="ml-auto bg-foreground text-background px-2 py-0.5 text-[10px]">
                          {totalItems}
                        </span>
                      )}
                    </Button>
                  </Link>
                  <Link
                    href="/progress"
                    className="block"
                    onClick={() => setIsOpen(false)}
                  >
                    <Button
                      variant="outline"
                      className="w-full justify-start rounded-none h-12 uppercase tracking-wider"
                    >
                      <Trophy className="w-4 h-4 mr-2 text-amber-500" />
                      Progress
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="p-4 border-t">
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="w-full rounded-none h-12 uppercase tracking-widest"
            >
              Logout
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
