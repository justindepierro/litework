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
      className={`fixed bottom-0 left-0 right-0 bg-white border-t border-silver-300 ${className}`}
      style={{
        paddingBottom: "max(env(safe-area-inset-bottom), 0.5rem)",
      }}
    >
      <div className="flex items-center justify-around px-2 pt-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center min-w-16 py-2 px-3 rounded-lg transition-colors ${
                item.isActive
                  ? "text-primary bg-primary/10"
                  : "text-silver-600 hover:text-navy-900 hover:bg-silver-100"
              }`}
            >
              <Icon
                className={`w-6 h-6 mb-1 ${
                  item.isActive ? "text-primary" : "text-current"
                }`}
              />
              <Caption
                className={`text-xs font-medium ${
                  item.isActive ? "text-primary" : "text-current"
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
