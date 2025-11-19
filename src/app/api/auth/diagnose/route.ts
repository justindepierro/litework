import { NextResponse } from "next/server";
import { getAdminClient, getAuthenticatedUser } from "@/lib/auth-server";

/**
 * Diagnostic endpoint to help troubleshoot login issues
 * Access at: /api/auth/diagnose
 *
 * ⚠️ DISABLED IN PRODUCTION for security
 */
export async function GET() {
  // Disable in production to prevent information leakage
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Endpoint disabled in production" },
      { status: 403 }
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const diagnostics: Record<string, any> = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    checks: {},
  };

  // 1. Check environment variables
  diagnostics.checks.envVariables = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL
      ? "✅ SET"
      : "❌ MISSING",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ? "✅ SET"
      : "❌ MISSING",
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
      ? "✅ SET"
      : "❌ MISSING",
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "NOT SET",
  };

  // Show partial values (first 10 chars) for debugging without exposing full keys
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    diagnostics.checks.supabaseUrl = {
      value: process.env.NEXT_PUBLIC_SUPABASE_URL,
      valid: process.env.NEXT_PUBLIC_SUPABASE_URL.includes("supabase.co"),
    };
  }

  if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    diagnostics.checks.supabaseAnonKey = {
      preview:
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20) + "...",
      length: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length,
      startsWithEyJ:
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.startsWith("eyJ"),
    };
  }

  const supabase = getAdminClient();

  // 2. Test Supabase connection
  try {
    const { data, error } = await supabase
      .from("users")
      .select("count")
      .limit(1);

    diagnostics.checks.supabaseConnection = {
      status: error ? "❌ FAILED" : "✅ WORKING",
      error: error?.message,
      canQueryDatabase: !!data,
    };
  } catch (error) {
    diagnostics.checks.supabaseConnection = {
      status: "❌ FAILED",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }

  // 3. Test Supabase Auth
  const { user, error: authError } = await getAuthenticatedUser();
  diagnostics.checks.supabaseAuth = {
    status: authError ? "❌ FAILED" : "✅ WORKING",
    error: authError,
    hasSession: !!user,
    user: user
      ? {
          id: user.id,
          email: user.email,
          role: user.role,
        }
      : null,
  };

  // 4. Check deployed URL
  diagnostics.checks.deployment = {
    host: process.env.VERCEL_URL || "localhost",
    isProduction: process.env.VERCEL_ENV === "production",
    isVercel: !!process.env.VERCEL,
  };

  // 5. Overall health
  const failedChecks =
    JSON.stringify(diagnostics.checks).match(/❌/g)?.length || 0;

  diagnostics.summary = {
    status:
      failedChecks === 0
        ? "✅ ALL CHECKS PASSED"
        : `⚠️ ${failedChecks} ISSUES FOUND`,
    recommendation:
      failedChecks === 0
        ? "Authentication should work. If you're still having issues, check browser console for client-side errors."
        : "Fix the issues marked with ❌ above. Most likely: missing environment variables in Vercel dashboard.",
  };

  return NextResponse.json(diagnostics, { status: 200 });
}
