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
import { PageLoading } from "@/components/ui/LoadingSpinner";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Body, Heading } from "@/components/ui/Typography";

interface DiagnosticResult {
  timestamp: string;
  environment: string;
  checks: Record<string, unknown>;
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
    return <PageLoading />;
  }

  return (
    <div className="min-h-screen bg-(--bg-primary) py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <PageHeader
          title="Authentication Diagnostics"
          subtitle="Run Supabase client + server health checks to debug login issues."
          icon={<TestTube className="w-6 h-6" />}
          actions={
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <Button
                variant="primary"
                leftIcon={<RefreshCw className="w-4 h-4" />}
                onClick={runDiagnostics}
                disabled={isLoading}
                fullWidth
              >
                Refresh Diagnostics
              </Button>
              <Button
                variant="secondary"
                leftIcon={<TestTube className="w-4 h-4" />}
                onClick={testLogin}
                fullWidth
              >
                Test Login
              </Button>
            </div>
          }
        />

        <div className="bg-white rounded-lg shadow p-6">
          <Heading level="h4" className="mb-2">
            How to use this page
          </Heading>
          <Body variant="secondary">
            This dashboard walks through every layer that can block Supabase
            auth. Refresh diagnostics anytime you tweak environment variables or
            credentials, and review each section for ❌ indicators.
          </Body>
        </div>

        {/* CLIENT-SIDE DIAGNOSTICS */}
        <div className="bg-white rounded-lg shadow p-6">
          <Heading level="h3" className="mb-4 flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Client-Side Checks
          </Heading>
          <pre className="bg-(--bg-secondary) p-4 rounded overflow-auto text-sm">
            {JSON.stringify(clientDiagnostics, null, 2)}
          </pre>
        </div>

        {/* SERVER-SIDE DIAGNOSTICS */}
        {serverDiagnostics && (
          <div className="bg-white rounded-lg shadow p-6">
            <Heading level="h3" className="mb-4 flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              Server-Side Checks
            </Heading>

            <div className="mb-4 rounded border-l-4 border-(--accent-blue-500) bg-(--accent-blue-50) p-4">
              <Heading level="h4" className="mb-1">
                {serverDiagnostics.summary.status}
              </Heading>
              <Body variant="secondary">
                {serverDiagnostics.summary.recommendation}
              </Body>
            </div>

            <pre className="bg-(--bg-secondary) p-4 rounded overflow-auto text-sm">
              {JSON.stringify(serverDiagnostics, null, 2)}
            </pre>
          </div>
        )}

        {/* COMMON ISSUES */}
        <div className="bg-white rounded-lg shadow p-6">
          <Heading level="h3" className="mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Common Issues & Solutions
          </Heading>

          <div className="space-y-4">
            <div className="border-l-4 border-(--status-warning) pl-4">
              <Heading level="h4" className="mb-1">
                Missing Environment Variables
              </Heading>
              <Body variant="secondary">
                If you see &ldquo;MISSING&rdquo; for any environment variables,
                add them in Vercel:
                <br />
                <code className="bg-(--bg-secondary) px-2 py-1 rounded text-sm">
                  Vercel Dashboard → Project Settings → Environment Variables
                </code>
              </Body>
            </div>

            <div className="border-l-4 border-(--status-error) pl-4">
              <Heading level="h4" className="mb-1">
                Cookies Not Working
              </Heading>
              <Body variant="secondary">
                Supabase auth requires cookies. Check that:
                <br />
                • Browser allows cookies
                <br />
                • You&apos;re using HTTPS in production (not HTTP)
                <br />• No browser extensions blocking cookies
              </Body>
            </div>

            <div className="border-l-4 border-(--accent-blue-500) pl-4">
              <Heading level="h4" className="mb-1">
                CORS / Network Errors
              </Heading>
              <Body variant="secondary">
                If Supabase connection fails:
                <br />
                • Check Supabase dashboard is accessible
                <br />
                • Verify your Supabase project is not paused
                <br />• Check network tab in browser DevTools for blocked
                requests
              </Body>
            </div>

            <div className="border-l-4 border-(--status-success) pl-4">
              <Heading level="h4" className="mb-1">
                Test Credentials
              </Heading>
              <Body variant="secondary">
                Coach account:{" "}
                <code className="bg-(--bg-secondary) px-2 py-1 rounded text-sm">
                  jdepierro@burkecatholic.org
                </code>
                <br />
                Password:{" "}
                <code className="bg-(--bg-secondary) px-2 py-1 rounded text-sm">
                  TempPassword123!
                </code>
              </Body>
            </div>
          </div>
        </div>

        {/* QUICK FIXES */}
        <div className="bg-white rounded-lg shadow p-6">
          <Heading level="h3" className="mb-4">
            Quick Fixes
          </Heading>

          <div className="space-y-3">
            <Button
              variant="secondary"
              onClick={() => {
                localStorage.clear();
                alert("✅ LocalStorage cleared. Try logging in again.");
              }}
              fullWidth
              className="justify-start"
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Clear LocalStorage (fixes stale session data)
            </Button>

            <Button
              variant="secondary"
              onClick={async () => {
                document.cookie.split(";").forEach((c) => {
                  document.cookie =
                    c.trim().split("=")[0] +
                    "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/";
                });
                alert("✅ All cookies cleared. Try logging in again.");
              }}
              fullWidth
              className="justify-start"
              leftIcon={<Cookie className="w-4 h-4" />}
            >
              Clear All Cookies (fixes cookie corruption)
            </Button>

            <Button
              variant="danger"
              onClick={async () => {
                await supabase.auth.signOut();
                alert("✅ Signed out. Try logging in again.");
              }}
              fullWidth
              className="justify-start"
              leftIcon={<LogOut className="w-4 h-4" />}
            >
              Force Sign Out (clears Supabase session)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
