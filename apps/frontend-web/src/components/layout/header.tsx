"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { LoginDialog } from "@/components/auth/login-dialog";
import { UserMenu } from "@/components/auth/user-menu";
import { CartDropdown } from "@/components/cart/cart-dropdown";
import { SearchDropdown } from "@/components/search/search-dropdown";
import { WishlistDropdown } from "@/components/wishlist/wishlist-dropdown";
import Logo from "@/assets/logo-dark.png";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function Header() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-16 bg-background" />;

  const isAdmin = user?.roles.includes("admin");

  if (isAdmin) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link
            href="/admin"
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="relative h-8 w-auto aspect-[3/1]">
              <Image
                src={Logo}
                alt="BrandBazaar Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <UserMenu />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 cursor-pointer">
          <div className="relative h-8 w-auto aspect-[3/1]">
            <Image
              src={Logo}
              alt="BrandBazaar Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/explore"
            className={cn(
              "text-sm font-medium hover:text-primary uppercase tracking-wider transition-colors cursor-pointer relative",
              pathname.startsWith("/explore") &&
                "underline decoration-2 underline-offset-4"
            )}
          >
            Explore
          </Link>
          <Link
            href="/raffles"
            className={cn(
              "text-sm font-medium hover:text-primary uppercase tracking-wider transition-colors cursor-pointer relative",
              pathname.startsWith("/raffles") &&
                "underline decoration-2 underline-offset-4"
            )}
          >
            Raffles
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <SearchDropdown />

          <WishlistDropdown />

          {user ? (
            <UserMenu showUsername />
          ) : (
            <LoginDialog>
              <Button variant="ghost" size="icon" className="cursor-pointer">
                <User className="h-5 w-5" />
                <span className="sr-only">Login</span>
              </Button>
            </LoginDialog>
          )}

          <CartDropdown />
        </div>
      </div>
    </header>
  );
}
