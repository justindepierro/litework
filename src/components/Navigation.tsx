"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import {
  Dumbbell,
  BarChart3,
  Users,
  Calendar,
  TrendingUp,
  LogOut,
  LogIn,
} from "lucide-react";

export default function Navigation() {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
                  Welcome, {user.name}
                </span>
                <Link
                  href="/dashboard"
                  className="hover:text-accent-green px-3 py-2 rounded-lg transition-colors text-white font-medium touch-manipulation"
                >
                  Dashboard
                </Link>
                {(user.role === "admin" || user.role === "coach") && (
                  <>
                    <Link
                      href="/workouts"
                      className="hover:text-accent-orange px-3 py-2 rounded-lg transition-colors text-white font-medium touch-manipulation"
                    >
                      Workouts
                    </Link>
                    <Link
                      href="/athletes"
                      className="hover:text-accent-purple px-3 py-2 rounded-lg transition-colors text-white font-medium touch-manipulation"
                    >
                      Athletes
                    </Link>
                  </>
                )}
                <Link
                  href="/schedule"
                  className="hover:text-accent-blue px-3 py-2 rounded-lg transition-colors text-white font-medium touch-manipulation"
                >
                  Schedule
                </Link>
                <Link
                  href="/progress"
                  className="hover:text-accent-pink px-3 py-2 rounded-lg transition-colors text-white font-medium touch-manipulation"
                >
                  Progress
                </Link>
                <button
                  onClick={logout}
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
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
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
                <div className="text-xs text-silver-300 mt-1">{user.name}</div>
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

              <button
                onClick={() => {
                  logout();
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
}
