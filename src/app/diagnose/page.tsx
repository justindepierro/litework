"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import {
  RefreshCw,
  TestTube,
  Smartphone,
  Monitor,
  Lightbulb,
  Trash2,
  Cookie,
  LogOut,
} from "lucide-react";

interface DiagnosticResult {
  timestamp: string;
  environment: string;
  checks: Record<string, any>;
  summary: {
    status: string;
    recommendation: string;
  };
}

export default function DiagnosePage() {
  const [serverDiagnostics, setServerDiagnostics] =
    useState<DiagnosticResult | null>(null);
  const [clientDiagnostics, setClientDiagnostics] = useState<
    Record<string, unknown>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const hasInitialized = useRef(false);

  const runDiagnostics = async () => {
    setIsLoading(true);

    // CLIENT-SIDE CHECKS
    const clientChecks: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
      browser: {
        userAgent: navigator.userAgent,
        cookiesEnabled: navigator.cookieEnabled,
        language: navigator.language,
      },
      environment: {
        protocol: window.location.protocol,
        host: window.location.host,
        isHTTPS: window.location.protocol === "https:",
      },
      localStorage: {
        available: typeof Storage !== "undefined",
        supabaseKeys: Object.keys(localStorage).filter((key) =>
          key.includes("supabase")
        ),
      },
      cookies: {
        all: document.cookie.split("; ").map((c) => c.split("=")[0]),
        supabaseCookies: document.cookie
          .split("; ")
          .filter((c) => c.includes("supabase"))
          .map((c) => c.split("=")[0]),
      },
    };

    // Test Supabase client connection
    try {
      const { data, error } = await supabase.auth.getSession();
      clientChecks.supabaseClient = {
        status: error ? "❌ FAILED" : "✅ WORKING",
        error: error?.message,
        hasSession: !!data.session,
        sessionExpiry: data.session?.expires_at,
      };
    } catch (error) {
      clientChecks.supabaseClient = {
        status: "❌ FAILED",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }

    // Check environment variables accessible to client
    clientChecks.publicEnvVars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL
        ? "✅ SET"
        : "❌ MISSING",
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "NOT SET",
    };

    setClientDiagnostics(clientChecks);

    // SERVER-SIDE CHECKS
    try {
      const response = await fetch("/api/auth/diagnose");
      const data = await response.json();
      setServerDiagnostics(data);
    } catch (error) {
      console.error("Failed to fetch server diagnostics:", error);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    // Run diagnostics on mount - prevent double execution in strict mode
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    
    // eslint-disable-next-line react-hooks/set-state-in-effect
    runDiagnostics();
  }, []);

  const testLogin = async () => {
    const email = prompt("Enter email to test:");
    const password = prompt("Enter password to test:");

    if (!email || !password) return;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      alert(
        error
          ? `❌ Login failed: ${error.message}`
          : `✅ Login successful! User: ${data.user?.email}`
      );
    } catch (error) {
      alert(
        `❌ Login error: ${error instanceof Error ? error.message : "Unknown"}`
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-4">
            Authentication Diagnostics
          </h1>
          <p className="text-gray-600 mb-4">
            This page helps diagnose login issues. Check for any ❌ marks below.
          </p>

          <div className="flex gap-4">
            <button
              onClick={runDiagnostics}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Diagnostics
            </button>

            <button
              onClick={testLogin}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
            >
              <TestTube className="w-4 h-4" />
              Test Login
            </button>
          </div>
        </div>

        {/* CLIENT-SIDE DIAGNOSTICS */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Client-Side Checks
          </h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(clientDiagnostics, null, 2)}
          </pre>
        </div>

        {/* SERVER-SIDE DIAGNOSTICS */}
        {serverDiagnostics && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              Server-Side Checks
            </h2>

            <div className="mb-4 p-4 bg-blue-50 rounded border-l-4 border-blue-500">
              <div className="font-bold text-lg mb-2">
                {serverDiagnostics.summary.status}
              </div>
              <div className="text-gray-700">
                {serverDiagnostics.summary.recommendation}
              </div>
            </div>

            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(serverDiagnostics, null, 2)}
            </pre>
          </div>
        )}

        {/* COMMON ISSUES */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Common Issues & Solutions
          </h2>

          <div className="space-y-4">
            <div className="border-l-4 border-yellow-500 pl-4">
              <h3 className="font-bold">Missing Environment Variables</h3>
              <p className="text-gray-700">
                If you see &ldquo;MISSING&rdquo; for any environment variables,
                add them in Vercel:
                <br />
                <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                  Vercel Dashboard → Project Settings → Environment Variables
                </code>
              </p>
            </div>

            <div className="border-l-4 border-red-500 pl-4">
              <h3 className="font-bold">Cookies Not Working</h3>
              <p className="text-gray-700">
                Supabase auth requires cookies. Check that:
                <br />
                • Browser allows cookies
                <br />
                • You&apos;re using HTTPS in production (not HTTP)
                <br />• No browser extensions blocking cookies
              </p>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-bold">CORS / Network Errors</h3>
              <p className="text-gray-700">
                If Supabase connection fails:
                <br />
                • Check Supabase dashboard is accessible
                <br />
                • Verify your Supabase project is not paused
                <br />• Check network tab in browser DevTools for blocked
                requests
              </p>
            </div>

            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-bold">Test Credentials</h3>
              <p className="text-gray-700">
                Coach account:{" "}
                <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                  jdepierro@burkecatholic.org
                </code>
                <br />
                Password:{" "}
                <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                  TempPassword123!
                </code>
              </p>
            </div>
          </div>
        </div>

        {/* QUICK FIXES */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Quick Fixes</h2>

          <div className="space-y-3">
            <button
              onClick={() => {
                localStorage.clear();
                alert("✅ LocalStorage cleared. Try logging in again.");
              }}
              className="w-full px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-left flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear LocalStorage (fixes stale session data)
            </button>

            <button
              onClick={async () => {
                document.cookie.split(";").forEach((c) => {
                  document.cookie =
                    c.trim().split("=")[0] +
                    "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/";
                });
                alert("✅ All cookies cleared. Try logging in again.");
              }}
              className="w-full px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-left flex items-center gap-2"
            >
              <Cookie className="w-4 h-4" />
              Clear All Cookies (fixes cookie corruption)
            </button>

            <button
              onClick={async () => {
                await supabase.auth.signOut();
                alert("✅ Signed out. Try logging in again.");
              }}
              className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-left flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Force Sign Out (clears Supabase session)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
