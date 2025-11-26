"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, History, TrendingUp, User } from "lucide-react";
import { Caption } from "@/components/ui/Typography";

interface BottomNavProps {
  className?: string;
}

export function BottomNav({ className = "" }: BottomNavProps) {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/dashboard",
      label: "Home",
      icon: Home,
      isActive: pathname === "/dashboard",
    },
    {
      href: "/history",
      label: "History",
      icon: History,
      isActive: pathname === "/history",
    },
    {
      href: "/progress",
      label: "Progress",
      icon: TrendingUp,
      isActive: pathname === "/progress",
    },
    {
      href: "/profile",
      label: "Profile",
      icon: User,
      isActive: pathname === "/profile",
    },
  ];

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-silver-300 shadow-lg md:hidden ${className}`}
      style={{
        paddingBottom: "max(env(safe-area-inset-bottom), 0.5rem)",
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
      }}
      role="navigation"
      aria-label="Mobile bottom navigation"
    >
      <div className="flex items-center justify-around px-2 pt-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center touch-target flex-1 max-w-24 py-2 px-2 rounded-xl transition-all duration-200 ${
                item.isActive
                  ? "text-primary bg-primary/10 scale-105"
                  : "text-silver-600 active:bg-silver-100 active:scale-95"
              }`}
              aria-label={item.label}
              aria-current={item.isActive ? "page" : undefined}
            >
              <Icon
                className={`w-6 h-6 mb-1 transition-transform ${
                  item.isActive ? "text-primary scale-110" : "text-current"
                }`}
              />
              <Caption
                className={`text-xs font-medium leading-tight ${
                  item.isActive ? "text-primary font-semibold" : "text-current"
                }`}
              >
                {item.label}
              </Caption>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
