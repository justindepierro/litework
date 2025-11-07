// CLIENT-SIDE AUTH ONLY
// Enhanced wrapper around Supabase Auth with security features

import { supabase } from "./supabase";
import {
  validateEmail,
  validatePassword,
  validateName,
  sanitizeInput,
  checkRateLimit,
  getRateLimit,
  resetRateLimit,
  getClientFingerprint,
  logSecurityEvent,
  createAuditLog,
} from "./security";
import {
  generateCorrelationId,
  logAuthEvent,
  AuthTimer,
  classifyAuthError,
} from "./auth-logger";

export interface User {
  id: string;
  email: string;
  role: "admin" | "coach" | "athlete";
  firstName: string;
  lastName: string;
  fullName: string;
}

/**
 * Sign up new user with validation and rate limiting
 */
export async function signUp(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  inviteId?: string // Add optional invite ID parameter
) {
  // Rate limiting
  const clientId = getClientFingerprint();
  const rateCheck = checkRateLimit(clientId, getRateLimit("signup"));

  if (!rateCheck.allowed) {
    const waitMinutes = Math.ceil((rateCheck.resetAt - Date.now()) / 60000);
    logSecurityEvent(
      createAuditLog("signup_rate_limited", false, { email, clientId })
    );
    throw new Error(
      `Too many signup attempts. Please try again in ${waitMinutes} minutes.`
    );
  }

  // Validate inputs
  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    throw new Error(emailValidation.error);
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    throw new Error(passwordValidation.error);
  }

  const firstNameValidation = validateName(firstName, "First name");
  if (!firstNameValidation.valid) {
    throw new Error(firstNameValidation.error);
  }

  const lastNameValidation = validateName(lastName, "Last name");
  if (!lastNameValidation.valid) {
    throw new Error(lastNameValidation.error);
  }

  // Sanitize inputs
  const sanitizedFirstName = sanitizeInput(firstName);
  const sanitizedLastName = sanitizeInput(lastName);
  const sanitizedEmail = email.trim().toLowerCase();

  try {
    // Load invite data if invite ID provided
    let inviteData = null;
    if (inviteId) {
      const { data: invite, error: inviteError } = await supabase
        .from("invites")
        .select("*")
        .eq("id", inviteId)
        .eq("status", "pending")
        .single();

      if (!inviteError && invite) {
        inviteData = invite;
      }
    }

    const { data, error } = await supabase.auth.signUp({
      email: sanitizedEmail,
      password,
      options: {
        data: {
          first_name: sanitizedFirstName,
          last_name: sanitizedLastName,
        },
      },
    });

    if (error) {
      logSecurityEvent(
        createAuditLog("signup_failed", false, {
          email: sanitizedEmail,
          error: error.message,
        })
      );
      throw error;
    }

    if (!data.user) {
      throw new Error("Signup succeeded but no user data returned");
    }

    // Wait a moment for the database trigger to create the user profile
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Update user profile with data from invite if available
    // The trigger already created the basic profile, we just need to update it with invite data
    if (inviteData) {
      const { error: profileError } = await supabase
        .from("users")
        .update({
          bio: inviteData.bio || null,
          notes: inviteData.notes || null,
          date_of_birth: inviteData.date_of_birth || null,
          injury_status: inviteData.injury_status || null,
          group_ids: inviteData.group_ids || [],
          coach_id: inviteData.invited_by || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", data.user.id);

      if (profileError) {
        console.error(
          "Failed to update user profile with invite data:",
          profileError
        );
        // Don't throw here - user is created, just missing some profile data
      }
    }

    // Add athlete to groups from invite
    if (inviteData?.group_ids && inviteData.group_ids.length > 0) {
      for (const groupId of inviteData.group_ids) {
        try {
          // Get current group
          const { data: group } = await supabase
            .from("athlete_groups")
            .select("athlete_ids")
            .eq("id", groupId)
            .single();

          if (group) {
            // Add athlete to group's athlete_ids array
            const currentAthleteIds = group.athlete_ids || [];
            const updatedAthleteIds = Array.from(
              new Set([...currentAthleteIds, data.user.id])
            );

            await supabase
              .from("athlete_groups")
              .update({ athlete_ids: updatedAthleteIds })
              .eq("id", groupId);
          }
        } catch (err) {
          console.error(`Failed to add athlete to group ${groupId}:`, err);
          // Continue with other groups even if one fails
        }
      }
    }

    // Reset rate limit on success
    resetRateLimit(clientId);

    logSecurityEvent(
      createAuditLog("signup_success", true, {
        email: sanitizedEmail,
        userId: data.user?.id,
        emailConfirmed: !!data.user?.email_confirmed_at,
        inviteUsed: !!inviteId,
      })
    );

    // Return data including confirmation status
    return {
      ...data,
      needsEmailConfirmation: !data.user?.email_confirmed_at && !data.session,
    };
  } catch (error) {
    logSecurityEvent(
      createAuditLog("signup_error", false, {
        email: sanitizedEmail,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    );
    throw error;
  }
}

/**
 * Sign in existing user with validation and rate limiting
 */
export async function signIn(email: string, password: string) {
  const correlationId = generateCorrelationId();
  const timer = new AuthTimer(correlationId, "sign_in");

  // Rate limiting per email to prevent brute force
  const emailKey = email.trim().toLowerCase();
  const rateCheck = checkRateLimit(emailKey, getRateLimit("login"));

  if (!rateCheck.allowed) {
    const waitMinutes = Math.ceil((rateCheck.resetAt - Date.now()) / 60000);
    const message = `Too many login attempts. Please try again in ${waitMinutes} minutes.`;

    logAuthEvent(correlationId, "warn", "sign_in", "Rate limit exceeded", {
      email: emailKey,
      waitMinutes,
    });

    logSecurityEvent(
      createAuditLog("login_rate_limited", false, { email: emailKey })
    );

    throw new Error(message);
  }

  // Validate email
  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    logAuthEvent(
      correlationId,
      "warn",
      "validation",
      "Email validation failed",
      {
        error: emailValidation.error,
      }
    );
    throw new Error(emailValidation.error);
  }

  const sanitizedEmail = email.trim().toLowerCase();

  logAuthEvent(correlationId, "info", "sign_in", "Attempting sign in", {
    email: sanitizedEmail,
  });

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: sanitizedEmail,
      password,
    });

    if (error) {
      const classified = classifyAuthError(error);

      logAuthEvent(correlationId, "error", "sign_in", classified.userMessage, {
        email: sanitizedEmail,
        errorType: classified.type,
        remainingAttempts: rateCheck.remainingAttempts,
      });

      logSecurityEvent(
        createAuditLog("login_failed", false, {
          email: sanitizedEmail,
          error: error.message,
          remainingAttempts: rateCheck.remainingAttempts,
        })
      );

      throw new Error(classified.userMessage);
    }

    // Reset rate limit on successful login
    resetRateLimit(emailKey);

    timer.end("Sign in successful", {
      email: sanitizedEmail,
      userId: data.user?.id,
    });

    logSecurityEvent(
      createAuditLog("login_success", true, {
        email: sanitizedEmail,
        userId: data.user?.id,
      })
    );

    return data;
  } catch (error) {
    const classified = classifyAuthError(error);
    timer.error("Sign in error", classified);

    logSecurityEvent(
      createAuditLog("login_error", false, {
        email: sanitizedEmail,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    );

    throw error;
  }
}

// Sign out
export async function signOut() {
  const correlationId = generateCorrelationId();
  const timer = new AuthTimer(correlationId, "sign_out");

  try {
    logAuthEvent(correlationId, "info", "sign_out", "Signing out user");

    const { error } = await supabase.auth.signOut();

    if (error) {
      const classified = classifyAuthError(error);
      timer.error("Sign out failed", classified);
      throw error;
    }

    timer.end("Sign out successful");
  } catch (error) {
    const classified = classifyAuthError(error);
    logAuthEvent(
      correlationId,
      "error",
      "sign_out",
      classified.technicalMessage,
      { error }
    );
    throw error;
  }
}

/**
 * Request a password reset email with validation and rate limiting
 */
export async function requestPasswordReset(email: string) {
  const emailValidation = validateEmail(email);

  if (!emailValidation.valid) {
    throw new Error(emailValidation.error || "Invalid email address");
  }

  const sanitizedEmail = email.trim().toLowerCase();
  const rateCheck = checkRateLimit(
    `password-reset:${sanitizedEmail}`,
    getRateLimit("passwordReset")
  );

  if (!rateCheck.allowed) {
    const waitMinutes = Math.max(
      1,
      Math.ceil((rateCheck.resetAt - Date.now()) / 60000)
    );

    logSecurityEvent(
      createAuditLog("password_reset_rate_limited", false, {
        email: sanitizedEmail,
        waitMinutes,
      })
    );

    throw new Error(
      `Too many password reset attempts. Try again in ${waitMinutes} minute${
        waitMinutes === 1 ? "" : "s"
      }.`
    );
  }

  try {
    const redirectBase =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_SITE_URL || "";

    const redirectTo = redirectBase
      ? `${redirectBase.replace(/\/$/, "")}/update-password`
      : undefined;

    const { error } = await supabase.auth.resetPasswordForEmail(
      sanitizedEmail,
      redirectTo ? { redirectTo } : undefined
    );

    if (error) {
      logSecurityEvent(
        createAuditLog("password_reset_request_failed", false, {
          email: sanitizedEmail,
          error: error.message,
          remainingAttempts: rateCheck.remainingAttempts,
        })
      );
      throw new Error(
        "We couldn't send reset instructions right now. Please try again shortly."
      );
    }

    logSecurityEvent(
      createAuditLog("password_reset_requested", true, {
        email: sanitizedEmail,
        redirectTo,
      })
    );
  } catch (err) {
    logSecurityEvent(
      createAuditLog("password_reset_request_error", false, {
        email: sanitizedEmail,
        error: err instanceof Error ? err.message : "Unknown error",
      })
    );

    if (err instanceof Error) {
      throw err;
    }

    throw new Error(
      "Something went wrong while requesting the password reset. Please try again."
    );
  }
}

/**
 * Complete the password reset for an authenticated recovery session
 */
export async function completePasswordReset(newPassword: string) {
  const passwordValidation = validatePassword(newPassword);

  if (!passwordValidation.valid) {
    throw new Error(
      passwordValidation.error || "Password does not meet requirements"
    );
  }

  const session = await getSession();

  if (!session?.user) {
    throw new Error(
      "Your reset session expired. Please request a new password reset email."
    );
  }

  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      logSecurityEvent(
        createAuditLog("password_reset_update_failed", false, {
          userId: session.user.id,
          error: error.message,
        })
      );
      throw new Error(
        "We couldn't update your password. Please try again or request a new reset link."
      );
    }

    logSecurityEvent(
      createAuditLog("password_reset_update_success", true, {
        userId: session.user.id,
        strength: passwordValidation.strength,
      })
    );
  } catch (err) {
    logSecurityEvent(
      createAuditLog("password_reset_update_error", false, {
        userId: session.user.id,
        error: err instanceof Error ? err.message : "Unknown error",
      })
    );

    if (err instanceof Error) {
      throw err;
    }

    throw new Error(
      "Unexpected error while updating the password. Please try again."
    );
  }
}

// Get current session
export async function getSession() {
  const correlationId = generateCorrelationId();
  const timer = new AuthTimer(correlationId, "session_check");

  try {
    logAuthEvent(
      correlationId,
      "debug",
      "session_check",
      "Fetching session from Supabase"
    );

    // Add a timeout to prevent infinite hanging
    const sessionPromise = supabase.auth.getSession();
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Session fetch timeout")), 3000)
    );

    const {
      data: { session },
      error,
    } = await Promise.race([sessionPromise, timeoutPromise]);

    if (error) {
      const classified = classifyAuthError(error);
      timer.error("Session fetch failed", classified);
      throw error;
    }

    timer.end(session ? "Session found" : "No active session", {
      hasSession: !!session,
    });
    return session;
  } catch (error) {
    const classified = classifyAuthError(error);
    logAuthEvent(correlationId, "error", "error", classified.technicalMessage, {
      error,
    });
    return null;
  }
}

// Get current user with profile data
export async function getCurrentUser(): Promise<User | null> {
  const correlationId = generateCorrelationId();
  const timer = new AuthTimer(correlationId, "profile_fetch");

  try {
    logAuthEvent(
      correlationId,
      "info",
      "profile_fetch",
      "Getting current user"
    );

    // Get session with timeout protection
    const session = await getSession();

    if (!session?.user) {
      timer.end("No session found - user not authenticated");
      return null;
    }

    logAuthEvent(
      correlationId,
      "debug",
      "profile_fetch",
      "Session found, fetching user profile",
      {
        userId: session.user.id,
      }
    );

    // Get user profile from database with timeout
    const profilePromise = supabase
      .from("users")
      .select("*")
      .eq("id", session.user.id)
      .single();

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Profile fetch timeout")), 3000)
    );

    const { data: profile, error } = await Promise.race([
      profilePromise,
      timeoutPromise,
    ]);

    if (error) {
      const classified = classifyAuthError(error);
      timer.error("Profile fetch failed", classified);
      return null;
    }

    if (!profile) {
      timer.error("No profile found in database", { userId: session.user.id });
      return null;
    }

    const user: User = {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      firstName: profile.first_name || profile.name?.split(" ")[0] || "",
      lastName: profile.last_name || profile.name?.split(" ")[1] || "",
      fullName: profile.name,
    };

    timer.end("User profile loaded successfully", {
      userId: user.id,
      role: user.role,
    });

    return user;
  } catch (error) {
    const classified = classifyAuthError(error);
    timer.error(classified.technicalMessage, error);
    return null;
  }
}

/**
 * Refresh the current session to prevent expiry
 */
export async function refreshSession() {
  try {
    const { data, error } = await supabase.auth.refreshSession();

    if (error) {
      console.error("[AUTH_CLIENT] Session refresh failed:", error);
      throw error;
    }

    console.log("[AUTH_CLIENT] Session refreshed successfully");
    return data.session;
  } catch (error) {
    console.error("[AUTH_CLIENT] Unexpected error refreshing session:", error);
    throw error;
  }
}

// Listen to auth changes
export function onAuthChange(callback: (user: User | null) => void) {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      const user = await getCurrentUser();
      callback(user);
    } else {
      callback(null);
    }
  });
}
