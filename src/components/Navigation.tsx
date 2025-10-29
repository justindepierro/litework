"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

export default function Navigation() {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-color-navy-800 border-b border-color-navy-600 shadow-sm">
      <div className="container-responsive">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <Link
            href="/"
            className="text-heading-primary text-xl font-bold text-white hover:text-accent-orange transition-colors"
          >
            💪 LiteWork
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-body-small hidden lg:block text-silver-200">
                  Welcome, {user.name}
                </span>
                <Link
                  href="/dashboard"
                  className="hover:text-accent-green px-2 py-1 rounded transition-colors text-white"
                >
                  Dashboard
                </Link>
                {(user.role === "admin" || user.role === "coach") && (
                  <>
                    <Link
                      href="/workouts"
                      className="hover:text-accent-orange px-2 py-1 rounded transition-colors text-white"
                    >
                      Workouts
                    </Link>
                    <Link
                      href="/members"
                      className="hover:text-accent-purple px-2 py-1 rounded transition-colors text-white"
                    >
                      Members
                    </Link>
                  </>
                )}
                <Link
                  href="/schedule"
                  className="hover:text-accent-blue px-2 py-1 rounded transition-colors text-white"
                >
                  Schedule
                </Link>
                <Link
                  href="/progress"
                  className="hover:text-accent-pink px-2 py-1 rounded transition-colors text-white"
                >
                  Progress
                </Link>
                <button
                  onClick={logout}
                  className="px-3 py-1 rounded text-sm transition-colors text-white bg-navy-800 hover:bg-navy-900"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="hover:text-accent-green px-2 py-1 rounded transition-colors"
              >
                Login
              </Link>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-silver-200 hover:text-white hover:bg-navy-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-colors"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {/* Hamburger icon */}
              <svg
                className={`${isMobileMenuOpen ? "hidden" : "block"} h-6 w-6`}
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
                className={`${isMobileMenuOpen ? "block" : "hidden"} h-6 w-6`}
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

      {/* Mobile menu */}
      <div
        className={`${isMobileMenuOpen ? "block" : "hidden"} md:hidden bg-navy-800`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1">
          {user ? (
            <>
              <div className="px-3 py-2 text-sm text-silver-200 border-b border-navy-600 mb-2">
                Welcome, {user.name}
              </div>
              <Link
                href="/dashboard"
                className="block px-3 py-2 rounded-md text-base font-medium hover:text-white hover:bg-navy-700 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="text-accent-green">📊</span> Dashboard
              </Link>
              {(user.role === "admin" || user.role === "coach") && (
                <>
                  <Link
                    href="/workouts"
                    className="block px-3 py-2 rounded-md text-base font-medium hover:text-white hover:bg-navy-700 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="text-accent-orange">💪</span> Workouts
                  </Link>
                  <Link
                    href="/members"
                    className="block px-3 py-2 rounded-md text-base font-medium hover:text-white hover:bg-navy-700 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="text-accent-purple">👥</span> Members
                  </Link>
                </>
              )}
              <Link
                href="/schedule"
                className="block px-3 py-2 rounded-md text-base font-medium hover:text-white hover:bg-navy-700 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="text-accent-blue">📅</span> Schedule
              </Link>
              <Link
                href="/progress"
                className="block px-3 py-2 rounded-md text-base font-medium hover:text-white hover:bg-navy-700 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="text-accent-pink">📈</span> Progress
              </Link>
              <button
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:text-white hover:bg-navy-700 transition-colors"
              >
                🚪 Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="block px-3 py-2 rounded-md text-base font-medium hover:text-white hover:bg-navy-700 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="text-accent-green">🔐</span> Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
