import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import {
  checkRateLimit,
  getRateLimitStatus,
  getClientIP,
  resetRateLimit,
} from "@/lib/rate-limit-server";
import { transformToCamel, transformToSnake } from "@/lib/case-transform";
import { validatePassword } from "@/lib/security";
import { sendEmailNotification } from "@/lib/email-service";
import {
  logInviteEvent,
  logSuspiciousInviteActivity,
} from "@/lib/invite-audit";
import { checkPasswordBreach } from "@/lib/password-breach-check";

// POST /api/invites/accept - Accept invitation and create athlete account
export async function POST(request: NextRequest) {
  try {
    // 1. Check rate limit FIRST (prevent brute force signup attempts)
    const ip = getClientIP(request.headers);
    const allowed = checkRateLimit(ip, "signup");

    if (!allowed) {
      const status = getRateLimitStatus(ip, "signup");
      console.warn(`[RATE_LIMIT] Signup attempt blocked for IP: ${ip}`);
      return NextResponse.json(
        {
          error: "Too many signup attempts. Please try again later.",
          details: `Rate limit exceeded. Try again after ${new Date(status.resetAt).toLocaleTimeString()}`,
          resetTime: status.resetAt,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": "3",
            "X-RateLimit-Remaining": `${status.remaining}`,
            "X-RateLimit-Reset": `${status.resetAt}`,
          },
        }
      );
    }

    const body = await request.json();
    const { inviteCode, password, email: submittedEmail } = body;

    if (!inviteCode || !password) {
      return NextResponse.json(
        { error: "Invitation code and password are required" },
        { status: 400 }
      );
    }

    // CRITICAL: Enforce password requirements on server
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      console.warn(
        `[SECURITY] Weak password attempt blocked - IP: ${ip}, Strength: ${passwordValidation.strength}`
      );
      return NextResponse.json(
        {
          error: "Password does not meet requirements",
          details: passwordValidation.error,
          strength: passwordValidation.strength,
          requirements: {
            minLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumber: true,
            requireSpecial: true,
          },
        },
        { status: 400 }
      );
    }

    // Warn if password is weak (but allow it - user was already warned on client)
    if (passwordValidation.strength === "weak") {
      console.warn(
        `[SECURITY] Weak password accepted after user warning - IP: ${ip}`
      );
    }

    // Check if password has been breached (HaveIBeenPwned)
    const breachCheck = await checkPasswordBreach(password);
    if (breachCheck.breached) {
      console.warn(
        `[SECURITY] Breached password detected - IP: ${ip}, Breach count: ${breachCheck.count}`
      );
      return NextResponse.json(
        {
          error: "Password found in data breach",
          details:
            breachCheck.count && breachCheck.count > 1000
              ? `This password has been compromised in ${breachCheck.count.toLocaleString()} data breaches. Please choose a different one.`
              : "This password has been found in known data breaches. Please choose a different password for better security.",
          breachCount: breachCheck.count,
        },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Find and validate invitation
    const { data: inviteRaw, error: inviteError } = await supabase
      .from("invites")
      .select("*")
      .eq("id", inviteCode)
      .eq("status", "pending")
      .single();

    if (inviteError || !inviteRaw) {
      return NextResponse.json(
        { error: "Invalid or expired invitation" },
        { status: 404 }
      );
    }

    const invite = transformToCamel(inviteRaw);

    // CRITICAL: Verify email matches invite (prevent invite hijacking)
    if (submittedEmail && invite.email) {
      const inviteEmail = invite.email.toLowerCase().trim();
      const providedEmail = submittedEmail.toLowerCase().trim();

      if (providedEmail !== inviteEmail) {
        console.warn(
          `[SECURITY] Email mismatch attempt - IP: ${ip}, Invite Email: ${inviteEmail}, Provided Email: ${providedEmail}`
        );

        // Log suspicious activity
        await logSuspiciousInviteActivity({
          inviteId: inviteCode,
          reason: "email_mismatch",
          ipAddress: ip,
          userAgent: request.headers.get("user-agent") || undefined,
          details: {
            attemptedEmail: providedEmail,
            expectedEmail: inviteEmail,
          },
        });

        return NextResponse.json(
          {
            error: "Email does not match invitation",
            details:
              "You must use the email address from your coach's invitation.",
          },
          { status: 400 }
        );
      }
    }

    // Check if invitation has expired
    const expiresAt = new Date(invite.expiresAt);
    if (expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Invitation has expired" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", invite.email.toLowerCase())
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Create user account via Supabase Auth
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: invite.email.toLowerCase(),
      password,
      options: {
        emailRedirectTo: `${appUrl}/auth/callback?next=/dashboard`,
        data: {
          firstName: invite.firstName,
          lastName: invite.lastName,
          role: invite.role || "athlete",
          inviteId: inviteCode, // Store for callback handler
        },
      },
    });

    if (signUpError || !authData.user) {
      console.error("Error creating user account:", signUpError);
      return NextResponse.json(
        { error: "Failed to create user account" },
        { status: 500 }
      );
    }

    // Check if email confirmation is required (no session = needs verification)
    const requiresVerification = !authData.session;

    if (requiresVerification) {
      console.log(
        `[AUTH] Email verification required for ${invite.email} (User ID: ${authData.user.id})`
      );

      // Create user profile but mark as pending verification
      await supabase.from("users").insert(
        transformToSnake({
          id: authData.user.id,
          email: invite.email.toLowerCase(),
          firstName: invite.firstName,
          lastName: invite.lastName,
          role: invite.role || "athlete",
          groupIds: invite.groupId ? [invite.groupId] : [],
        })
      );

      // Update invite status to pending verification
      await supabase
        .from("invites")
        .update(
          transformToSnake({
            status: "pending_verification",
            updatedAt: new Date().toISOString(),
          })
        )
        .eq("id", inviteCode);

      // Log audit event
      await logInviteEvent({
        inviteId: inviteCode,
        eventType: "accepted",
        targetId: authData.user.id,
        ipAddress: ip,
        userAgent: request.headers.get("user-agent") || undefined,
        metadata: {
          email: invite.email,
          firstName: invite.firstName,
          lastName: invite.lastName,
          requiresVerification: true,
        },
      });

      return NextResponse.json({
        success: true,
        requiresVerification: true,
        message:
          "Account created! Please check your email to verify your address.",
        email: invite.email,
      });
    }

    // Create user profile in users table
    const tosAcceptedAt = new Date().toISOString();
    const { error: profileError } = await supabase.from("users").insert(
      transformToSnake({
        id: authData.user.id,
        email: invite.email.toLowerCase(),
        firstName: invite.firstName,
        lastName: invite.lastName,
        role: invite.role || "athlete",
        groupIds: invite.groupId ? [invite.groupId] : [],
        tosAcceptedAt,
        tosVersion: "1.0",
        privacyPolicyAcceptedAt: tosAcceptedAt,
        privacyPolicyVersion: "1.0",
      })
    );

    if (profileError) {
      console.error("Error creating user profile:", profileError);
      // Try to clean up the auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: "Failed to create user profile" },
        { status: 500 }
      );
    }

    // Update invitation status with audit info
    const userAgent = request.headers.get("user-agent");
    await supabase
      .from("invites")
      .update(
        transformToSnake({
          status: "accepted",
          acceptedAt: new Date().toISOString(),
          acceptedIp: ip,
          acceptedUserAgent: userAgent,
        })
      )
      .eq("id", inviteCode);

    // Log audit event for accepted invite
    await logInviteEvent({
      inviteId: inviteCode,
      eventType: "accepted",
      targetId: authData.user.id,
      ipAddress: ip,
      userAgent: userAgent || undefined,
      metadata: {
        email: invite.email,
        firstName: invite.firstName,
        lastName: invite.lastName,
        requiresVerification: false,
      },
    });

    // Send welcome email to athlete
    try {
      await sendEmailNotification({
        to: invite.email,
        subject: "Welcome to LiteWork!",
        category: "invite",
        templateData: {
          userName: `${invite.firstName} ${invite.lastName}`,
          title: "Welcome to Your Team!",
          message:
            "You've successfully joined your coach's training program. Start tracking your workouts and reaching your goals!",
          actionUrl: `${appUrl}/dashboard`,
          actionText: "Go to Dashboard",
          details: [
            {
              label: "Next Steps",
              value:
                "Complete your profile and check your assigned workouts",
            },
          ],
        },
      });
      console.log(`[EMAIL] Welcome email sent to ${invite.email}`);
    } catch (emailError) {
      console.error("[EMAIL] Failed to send welcome email:", emailError);
      // Don't fail signup if email fails
    }

    // Send notification to coach
    if (invite.invitedBy) {
      try {
        const { data: coach } = await supabase
          .from("users")
          .select("email, first_name, last_name")
          .eq("id", invite.invitedBy)
          .single();

        if (coach?.email) {
          await sendEmailNotification({
            to: coach.email,
            subject: `${invite.firstName} ${invite.lastName} joined your team!`,
            category: "invite",
            templateData: {
              userName: `${coach.first_name} ${coach.last_name}`,
              title: "Athlete Joined",
              message: `${invite.firstName} ${invite.lastName} has accepted your invitation and created their account.`,
              actionUrl: `${appUrl}/athletes`,
              actionText: "View Athletes",
              details: [
                {
                  label: "Athlete",
                  value: `${invite.firstName} ${invite.lastName}`,
                },
                { label: "Email", value: invite.email },
                { label: "Joined", value: new Date().toLocaleDateString() },
              ],
            },
          });
          console.log(
            `[EMAIL] Coach notification sent to ${coach.email} for athlete ${invite.firstName} ${invite.lastName}`
          );
        }
      } catch (notifyError) {
        console.error("[EMAIL] Failed to send coach notification:", notifyError);
        // Don't fail signup if notification fails
      }
    }

    // 2. Reset rate limit on successful signup
    resetRateLimit(ip, "signup");

    return NextResponse.json({
      success: true,
      message: "Account created successfully",
      user: {
        id: authData.user.id,
        email: authData.user.email,
        firstName: invite.firstName,
        lastName: invite.lastName,
      },
    });
  } catch (error) {
    console.error("Error accepting invite:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
