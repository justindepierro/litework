import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { transformToSnake } from "@/lib/case-transform";

/**
 * Auth Callback Handler
 * Handles email verification and OAuth callbacks from Supabase Auth
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/dashboard";
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");

  // Handle errors from Supabase
  if (error) {
    console.error(`[AUTH] Callback error: ${error} - ${errorDescription}`);
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(errorDescription || error)}`,
        requestUrl.origin
      )
    );
  }

  // Exchange auth code for session
  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch (error) {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
              console.warn("[AUTH] Failed to set cookies in callback:", error);
            }
          },
        },
        auth: {
          storageKey: "litework-auth-token",
        },
      }
    );

    try {
      const { data, error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error(
          "[AUTH] Failed to exchange code for session:",
          exchangeError
        );
        return NextResponse.redirect(
          new URL("/login?error=verification_failed", requestUrl.origin)
        );
      }

      if (data.user) {
        console.log(
          `[AUTH] Email verified successfully for user: ${data.user.id}`
        );

        // Mark invite as fully accepted if inviteId exists in metadata
        const inviteId = data.user.user_metadata?.inviteId;
        if (inviteId) {
          const { error: updateError } = await supabase
            .from("invites")
            .update(
              transformToSnake({
                status: "accepted",
                acceptedAt: new Date().toISOString(),
              })
            )
            .eq("id", inviteId);

          if (updateError) {
            console.error(
              "[AUTH] Failed to update invite status:",
              updateError
            );
          } else {
            console.log(`[AUTH] Invite ${inviteId} marked as accepted`);
          }
        }

        // Redirect to the specified page (default: dashboard)
        return NextResponse.redirect(new URL(next, requestUrl.origin));
      }
    } catch (error) {
      console.error("[AUTH] Error in callback handler:", error);
      return NextResponse.redirect(
        new URL("/login?error=callback_error", requestUrl.origin)
      );
    }
  }

  // No code provided - redirect to login
  return NextResponse.redirect(new URL("/login", requestUrl.origin));
}
