"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useCallback, useMemo, memo, useEffect, useRef } from "react";
import {
  Dumbbell,
  BarChart3,
  Users,
  Calendar,
  TrendingUp,
  LogOut,
  LogIn,
  User,
  X,
  Menu,
} from "lucide-react";
import NotificationBell from "@/components/NotificationBell";

const Navigation = memo(function Navigation() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Optimize toggle function with useCallback
  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Prevent body scroll when menu is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  // Memoize user role checks
  const isCoachOrAdmin = useMemo(
    () => user?.role === "admin" || user?.role === "coach",
    [user?.role]
  );

  // Memoize navigation items based on user role
  const navigationItems = useMemo(() => {
    if (!user) return [];

    const items = [
      {
        href: "/dashboard",
        label: "Dashboard",
        icon: BarChart3,
        color: "text-accent-emerald-400 group-hover:text-accent-emerald-300",
      },
    ];

    if (isCoachOrAdmin) {
      items.push(
        {
          href: "/workouts",
          label: "Workouts",
          icon: Dumbbell,
          color: "text-accent-orange-500",
        },
        {
          href: "/athletes",
          label: "Athletes",
          icon: Users,
          color: "text-accent-purple-500",
        },
        {
          href: "/schedule",
          label: "Schedule",
          icon: Calendar,
          color: "text-accent-blue-500",
        }
      );
    } else {
      items.push(
        {
          href: "/workouts/history",
          label: "History",
          icon: TrendingUp,
          color: "text-accent-pink-500",
        },
        {
          href: "/progress",
          label: "Progress",
          icon: TrendingUp,
          color: "text-accent-cyan-500",
        },
        {
          href: "/schedule",
          label: "Schedule",
          icon: Calendar,
          color: "text-accent-blue-500",
        }
      );
    }

    // Add Design System link for admins only (dev tool)
    if (user?.role === "admin") {
      items.push({
        href: "/design-system",
        label: "Design System",
        icon: BarChart3, // Will use Palette if available
        color: "text-accent-indigo-500",
      });
    }

    return items;
  }, [user, isCoachOrAdmin]);

  // Modern scroll behavior with performance optimization
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Set scrolled state for styling (compact mode)
      setIsScrolled(currentScrollY > 20);

      // Show/hide navigation based on scroll direction
      if (currentScrollY < 10) {
        // Always show at top of page
        setIsVisible(true);
      } else if (currentScrollY < lastScrollY.current) {
        // Scrolling up - show nav
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        // Scrolling down - hide nav (only after 100px)
        setIsVisible(false);
        // Close mobile menu when hiding
        if (isMobileMenuOpen) {
          setIsMobileMenuOpen(false);
        }
      }

      lastScrollY.current = currentScrollY;
      ticking.current = false;
    };

    const requestTick = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          handleScroll();
        });
        ticking.current = true;
      }
    };

    const onScroll = () => {
      requestTick();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isMobileMenuOpen]);

  // Check if link is active
  const isActiveLink = useCallback(
    (href: string) => {
      if (href === "/dashboard") {
        return pathname === "/" || pathname === "/dashboard";
      }
      return pathname?.startsWith(href);
    },
    [pathname]
  );

  return (
    <>
      {/* Modern Navigation Bar with High Contrast */}
      <nav
        className={`
          fixed top-0 left-0 right-0 z-50
          transition-all duration-300 ease-in-out
          ${isVisible ? "translate-y-0" : "-translate-y-full"}
          ${
            isScrolled
              ? "bg-neutral-950/98 backdrop-blur-md shadow-xl border-b border-neutral-700"
              : "bg-neutral-950 border-b border-neutral-800"
          }
        `}
        style={{
          // Explicit background for iOS Safari - DARKER for better contrast
          backgroundColor: isScrolled
            ? "rgba(2, 6, 23, 0.98)"
            : "rgb(2, 6, 23)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`
            flex justify-between items-center 
            transition-all duration-300 ease-in-out
            ${isScrolled ? "h-14 sm:h-16" : "h-16 sm:h-18"}
          `}
          >
            {/* Logo/Brand - Modern Design */}
            <Link
              href="/"
              className="flex items-center gap-2 sm:gap-3 group transition-all hover:scale-105 active:scale-95"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-button-orange rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                <Dumbbell className="relative w-7 h-7 sm:w-8 sm:h-8 text-accent-orange-500 transition-colors" />
              </div>
              <span
                style={{ color: "#ffffff" }}
                className="text-xl sm:text-2xl font-bold text-white hidden xs:block"
              >
                LiteWork
              </span>
              <span
                style={{ color: "#ffffff" }}
                className="text-xl font-bold text-white xs:hidden"
              >
                LW
              </span>
            </Link>

            {/* Desktop Navigation - Modern Pills with High Contrast */}
            <div className="hidden md:flex items-center gap-2">
              {user && (
                <>
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = isActiveLink(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        style={{
                          color: isActive ? "#020617" : "#ffffff",
                        }}
                        className={`
                          group relative px-4 py-2 rounded-xl font-medium text-sm font-bold
                          transition-all duration-200 ease-in-out
                          flex items-center gap-2
                          ${
                            isActive
                              ? "bg-white text-neutral-950 shadow-lg shadow-white/20"
                              : "text-white hover:text-white hover:bg-white/10 active:bg-white/20"
                          }
                        `}
                      >
                        <Icon
                          className={`w-4 h-4 ${isActive ? "text-neutral-950" : item.color}`}
                        />
                        <span>{item.label}</span>
                        {isActive && (
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-transparent via-accent-orange-400 to-transparent rounded-full" />
                        )}
                      </Link>
                    );
                  })}

                  {/* Notification Bell */}
                  <div className="ml-2">
                    <NotificationBell />
                  </div>

                  {/* Profile Button */}
                  <Link
                    href="/profile"
                    style={{
                      color: pathname === "/profile" ? "#020617" : "#ffffff",
                    }}
                    className={`
                      group relative px-4 py-2 rounded-xl font-medium text-sm
                      transition-all duration-200 ease-in-out
                      flex items-center gap-2
                      ${
                        pathname === "/profile"
                          ? "bg-white text-neutral-950 shadow-lg shadow-white/20"
                          : "text-white hover:text-white hover:bg-white/10 active:bg-white/20"
                      }
                    `}
                  >
                    <User
                      className={`w-4 h-4 ${pathname === "/profile" ? "text-neutral-950" : "text-white"}`}
                    />
                    <span className="hidden lg:inline">Profile</span>
                  </Link>

                  {/* Logout Button */}
                  <button
                    onClick={signOut}
                    style={{ color: "#ffffff" }}
                    className="px-4 py-2 rounded-xl font-medium text-sm text-white hover:text-white hover:bg-accent-red-500/20 transition-all duration-200 flex items-center gap-2 ml-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden lg:inline">Logout</span>
                  </button>
                </>
              )}

              {!user && (
                <Link
                  href="/login"
                  className="px-6 py-2 rounded-xl font-semibold text-sm bg-gradient-button-orange text-white transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
              )}
            </div>

            {/* Mobile Menu Button - Enhanced */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2.5 rounded-xl text-white hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all active:scale-95 relative"
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              <Menu
                style={{ color: "#ffffff" }}
                className={`w-6 h-6 transition-all duration-200 ${isMobileMenuOpen ? "rotate-90 opacity-0 scale-50" : "rotate-0 opacity-100 scale-100"}`}
              />
              <X
                style={{ color: "#ffffff" }}
                className={`w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${isMobileMenuOpen ? "rotate-0 opacity-100 scale-100" : "rotate-90 opacity-0 scale-50"}`}
              />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay - Modern Slide-in */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ marginTop: isScrolled ? "3.5rem" : "4rem" }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-neutral-950/80 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Menu Panel */}
          <div
            ref={mobileMenuRef}
            className="relative h-full w-full max-w-sm ml-auto bg-neutral-900 shadow-2xl overflow-y-auto"
            style={{
              // Explicit background for iOS Safari
              backgroundColor: "rgb(15, 23, 42)",
            }}
          >
            {user ? (
              <div className="p-4 space-y-2">
                {/* User Info Card */}
                <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-2xl p-4 mb-4 border border-neutral-700">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-full bg-gradient-button-orange flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        style={{ color: "#ffffff" }}
                        className="text-white font-semibold text-sm"
                      >
                        {user.fullName || user.email}
                      </div>
                      <div
                        style={{ color: "#e2e8f0" }}
                        className="text-neutral-200 text-xs capitalize"
                      >
                        {user.role}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation Links */}
                <div className="space-y-1">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = isActiveLink(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        style={{
                          color: isActive ? "#020617" : "#ffffff",
                        }}
                        className={`
                          flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium text-base
                          transition-all duration-200 active:scale-95
                          ${
                            isActive
                              ? "bg-white text-neutral-950 shadow-lg"
                              : "text-white hover:text-white hover:bg-white/10"
                          }
                        `}
                      >
                        <Icon
                          className={`w-5 h-5 ${isActive ? "text-neutral-950" : item.color}`}
                        />
                        <span className="flex-1">{item.label}</span>
                        {isActive && (
                          <div className="w-2 h-2 rounded-full bg-accent-orange-400" />
                        )}
                      </Link>
                    );
                  })}
                </div>

                {/* Divider */}
                <div className="border-t border-neutral-700 my-4" />

                {/* Profile Link */}
                <Link
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{
                    color: pathname === "/profile" ? "#020617" : "#ffffff",
                  }}
                  className={`
                    flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium text-base
                    transition-all duration-200 active:scale-95
                    ${
                      pathname === "/profile"
                        ? "bg-white text-neutral-950 shadow-lg"
                        : "text-white hover:text-white hover:bg-white/10"
                    }
                  `}
                >
                  <User
                    className={`w-5 h-5 ${pathname === "/profile" ? "text-neutral-950" : "text-neutral-300"}`}
                  />
                  <span className="flex-1">Profile & Settings</span>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={() => {
                    signOut();
                    setIsMobileMenuOpen(false);
                  }}
                  style={{ color: "#f87171" }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium text-base text-accent-red-400 hover:text-accent-red-300 bg-accent-red-500/20 hover:bg-accent-red-500/30 transition-all duration-200 active:scale-95 mt-2"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="flex-1 text-left">Logout</span>
                </button>
              </div>
            ) : (
              <div className="p-4">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold text-base bg-gradient-button-orange text-white transition-all duration-200 active:scale-95 shadow-lg"
                >
                  <LogIn className="w-5 h-5" />
                  Login to Your Account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
});

export default Navigation;
