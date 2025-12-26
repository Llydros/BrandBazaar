"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Package, ShoppingBag, Users, Ticket } from "lucide-react";

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Products",
    href: "/admin/products",
    icon: Package,
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: ShoppingBag,
  },
  {
    title: "Customers",
    href: "/admin/customers",
    icon: Users,
  },
  {
    title: "Raffles",
    href: "/admin/raffles",
    icon: Ticket,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const selectedItem = sidebarItems.find((item) => {
    if (item.href === "/admin") {
      return pathname === "/admin";
    }
    return pathname === item.href || pathname.startsWith(item.href + "/");
  });

  return (
    <aside className="fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r bg-background">
      <div className="flex h-[calc(100vh-64px)] flex-col justify-between py-6">
        <nav className="space-y-1 px-4">
          {sidebarItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-none px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                selectedItem?.href === item.href
                  ? "bg-accent text-accent-foreground border-l-2 border-primary pl-[10px]"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}

