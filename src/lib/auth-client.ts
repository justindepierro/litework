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
  lastName: string
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

    // Create user profile in database
    const fullName = `${sanitizedFirstName} ${sanitizedLastName}`.trim();
    const { error: profileError } = await supabase.from("users").insert({
      id: data.user.id,
      email: sanitizedEmail,
      name: fullName,
      first_name: sanitizedFirstName,
      last_name: sanitizedLastName,
      role: "athlete", // Default role
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (profileError) {
      console.error("Failed to create user profile:", profileError);
      // Don't throw here - user is created in auth, trigger might handle it
    }

    // Reset rate limit on success
    resetRateLimit(clientId);

    logSecurityEvent(
      createAuditLog("signup_success", true, {
        email: sanitizedEmail,
        userId: data.user?.id,
        emailConfirmed: !!data.user?.email_confirmed_at,
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
  // Rate limiting per email to prevent brute force
  const emailKey = email.trim().toLowerCase();
  const rateCheck = checkRateLimit(emailKey, getRateLimit("login"));

  if (!rateCheck.allowed) {
    const waitMinutes = Math.ceil((rateCheck.resetAt - Date.now()) / 60000);
    logSecurityEvent(
      createAuditLog("login_rate_limited", false, { email: emailKey })
    );
    throw new Error(
      `Too many login attempts. Please try again in ${waitMinutes} minutes.`
    );
  }

  // Validate email
  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    throw new Error(emailValidation.error);
  }

  const sanitizedEmail = email.trim().toLowerCase();

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: sanitizedEmail,
      password,
    });

    if (error) {
      logSecurityEvent(
        createAuditLog("login_failed", false, {
          email: sanitizedEmail,
          error: error.message,
          remainingAttempts: rateCheck.remainingAttempts,
        })
      );
      throw error;
    }

    // Reset rate limit on successful login
    resetRateLimit(emailKey);

    logSecurityEvent(
      createAuditLog("login_success", true, {
        email: sanitizedEmail,
        userId: data.user?.id,
      })
    );

    return data;
  } catch (error) {
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
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
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
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}

// Get current user with profile data
export async function getCurrentUser(): Promise<User | null> {
  try {
    console.log("[AUTH_CLIENT] Getting session...");

    // Add timeout for session fetch (3 seconds)
    const sessionPromise = getSession();
    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => {
        console.warn("[AUTH_CLIENT] Session fetch timeout after 3s");
        resolve(null);
      }, 3000);
    });

    const session = await Promise.race([sessionPromise, timeoutPromise]);

    if (!session?.user) {
      console.log("[AUTH_CLIENT] No session found");
      return null;
    }

    console.log("[AUTH_CLIENT] Session found, fetching profile...");

    // Get user profile from database with timeout (2 seconds)
    const profilePromise = supabase
      .from("users")
      .select("*")
      .eq("id", session.user.id)
      .single();

    const profileTimeoutPromise = new Promise<{ data: null; error: Error }>(
      (resolve) => {
        setTimeout(() => {
          console.warn("[AUTH_CLIENT] Profile fetch timeout after 2s");
          resolve({ data: null, error: new Error("Profile fetch timeout") });
        }, 2000);
      }
    );

    const { data: profile, error } = await Promise.race([
      profilePromise,
      profileTimeoutPromise,
    ]);

    if (error) {
      console.error("[AUTH_CLIENT] Profile fetch error:", error);
      return null;
    }

    if (!profile) {
      console.error(
        "[AUTH_CLIENT] No profile found for user:",
        session.user.id
      );
      return null;
    }

    console.log("[AUTH_CLIENT] Profile loaded successfully");
    return {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      firstName: profile.first_name || profile.name?.split(" ")[0] || "",
      lastName: profile.last_name || profile.name?.split(" ")[1] || "",
      fullName: profile.name,
    };
  } catch (error) {
    console.error("[AUTH_CLIENT] Unexpected error in getCurrentUser:", error);
    return null;
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
