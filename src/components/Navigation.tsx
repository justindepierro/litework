"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useCallback, useMemo, memo } from "react";
import {
  Dumbbell,
  BarChart3,
  Users,
  Calendar,
  TrendingUp,
  LogOut,
  LogIn,
} from "lucide-react";
import NotificationBell from "@/components/NotificationBell";

// Memoized navigation link component for better performance
const NavigationLink = memo(function NavigationLink({
  href,
  children,
  className = "",
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      className={`hover:text-accent-green px-3 py-2 rounded-lg transition-colors text-white font-medium touch-manipulation ${className}`}
      onClick={onClick}
    >
      {children}
    </Link>
  );
});

const Navigation = memo(function Navigation() {
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Optimize toggle function with useCallback
  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  // Memoize user role checks
  const isCoachOrAdmin = useMemo(
    () => user?.role === "admin" || user?.role === "coach",
    [user?.role]
  );

  // Memoize navigation items based on user role
  const navigationItems = useMemo(() => {
    if (!user) return [];

    const items = [{ href: "/dashboard", label: "Dashboard" }];

    if (isCoachOrAdmin) {
      items.push(
        { href: "/workouts", label: "Workouts" },
        { href: "/athletes", label: "Athletes" },
        { href: "/schedule", label: "Schedule" }
      );
    } else {
      items.push(
        { href: "/workouts/history", label: "History" },
        { href: "/progress", label: "Progress" },
        { href: "/schedule", label: "Schedule" }
      );
    }

    return items;
  }, [user, isCoachOrAdmin]);

  return (
    <nav className="bg-color-navy-800 border-b border-color-navy-600 shadow-sm sticky top-0 z-40">
      <div className="container-responsive">
        <div className="flex justify-between items-center h-16 sm:h-18">
          {/* Logo/Brand - Enhanced for mobile */}
          <Link
            href="/"
            className="text-xl sm:text-2xl font-bold text-navy-700 flex items-center gap-2 touch-manipulation py-2 px-1"
          >
            <Dumbbell className="w-7 h-7 sm:w-6 sm:h-6 text-accent-orange" />
            <span className="hidden xs:block">LiteWork</span>
            <span className="xs:hidden">LW</span>
          </Link>

          {/* Desktop Navigation - Enhanced spacing */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
            {user ? (
              <>
                <span className="text-body-small hidden lg:block text-silver-200 mr-2">
                  Welcome, {user.fullName}
                </span>
                {navigationItems.map((item) => (
                  <NavigationLink
                    key={item.href}
                    href={item.href}
                    className={
                      item.label === "Dashboard"
                        ? "hover:text-accent-green"
                        : item.label === "Workouts"
                          ? "hover:text-accent-orange"
                          : item.label === "Athletes"
                            ? "hover:text-accent-purple"
                            : item.label === "Schedule"
                              ? "hover:text-accent-blue"
                              : "hover:text-accent-pink"
                    }
                  >
                    {item.label}
                  </NavigationLink>
                ))}
                <NotificationBell />
                <Link
                  href="/profile"
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors text-white bg-navy-700 hover:bg-navy-600 border border-navy-600 touch-manipulation"
                >
                  Profile
                </Link>
                <button
                  onClick={signOut}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors text-white bg-navy-800 hover:bg-navy-700 border border-navy-600 touch-manipulation"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="hover:text-accent-green px-4 py-2 rounded-lg transition-colors font-medium touch-manipulation"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button - Enhanced touch target */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-3 rounded-xl text-silver-200 hover:text-white hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-all touch-manipulation"
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {/* Hamburger icon */}
              <svg
                className={`${isMobileMenuOpen ? "hidden" : "block"} h-7 w-7 sm:h-6 sm:w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* Close icon */}
              <svg
                className={`${isMobileMenuOpen ? "block" : "hidden"} h-7 w-7 sm:h-6 sm:w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Mobile menu with better UX */}
      <div
        className={`${
          isMobileMenuOpen ? "block" : "hidden"
        } md:hidden bg-navy-800 border-t border-navy-600 shadow-lg`}
      >
        <div className="px-4 pt-4 pb-6 space-y-2">
          {user ? (
            <>
              <div className="px-4 py-3 text-sm text-silver-200 border-b border-navy-600 mb-4 bg-navy-900 rounded-lg">
                <div className="font-medium">Welcome back!</div>
                <div className="text-xs text-silver-300 mt-1">
                  {user.fullName}
                </div>
              </div>

              <Link
                href="/dashboard"
                className="flex items-center gap-3 px-4 py-4 rounded-xl text-base font-medium hover:text-white hover:bg-navy-700 transition-all touch-manipulation active:bg-navy-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <BarChart3 className="w-5 h-5 text-accent-green" />
                <span className="text-white">Dashboard</span>
              </Link>

              {(user.role === "admin" || user.role === "coach") && (
                <>
                  <Link
                    href="/workouts"
                    className="flex items-center gap-3 px-4 py-4 rounded-xl text-base font-medium hover:text-white hover:bg-navy-700 transition-all touch-manipulation active:bg-navy-600"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Dumbbell className="w-5 h-5 text-accent-orange" />
                    <span className="text-white">Workouts</span>
                  </Link>

                  <Link
                    href="/athletes"
                    className="flex items-center gap-3 px-4 py-4 rounded-xl text-base font-medium hover:text-white hover:bg-navy-700 transition-all touch-manipulation active:bg-navy-600"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Users className="w-5 h-5 text-accent-purple" />
                    <span className="text-white">Athletes</span>
                  </Link>
                </>
              )}

              <Link
                href="/schedule"
                className="flex items-center gap-3 px-4 py-4 rounded-xl text-base font-medium hover:text-white hover:bg-navy-700 transition-all touch-manipulation active:bg-navy-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Calendar className="w-5 h-5 text-accent-blue" />
                <span className="text-white">Schedule</span>
              </Link>

              <Link
                href="/progress"
                className="flex items-center gap-3 px-4 py-4 rounded-xl text-base font-medium hover:text-white hover:bg-navy-700 transition-all touch-manipulation active:bg-navy-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <TrendingUp className="w-5 h-5 text-accent-pink" />
                <span className="text-white">Progress</span>
              </Link>

              {/* Separator */}
              <div className="border-t border-navy-600 my-4"></div>

              <Link
                href="/profile"
                className="flex items-center gap-3 px-4 py-4 rounded-xl text-base font-medium hover:text-white hover:bg-navy-700 transition-all touch-manipulation active:bg-navy-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg
                  className="w-5 h-5 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span className="text-white">Profile</span>
              </Link>

              <button
                onClick={() => {
                  signOut();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 w-full text-left px-4 py-4 rounded-xl text-base font-medium hover:text-white hover:bg-red-900 transition-all touch-manipulation active:bg-red-800 bg-red-950"
              >
                <LogOut className="w-5 h-5 text-red-400" />
                <span className="text-red-300">Logout</span>
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-3 px-4 py-4 rounded-xl text-base font-medium hover:text-white hover:bg-navy-700 transition-all touch-manipulation active:bg-navy-600"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <LogIn className="w-5 h-5 text-accent-green" />
              <span className="text-white">Login</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
});

export default Navigation;
