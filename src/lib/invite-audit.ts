/**
 * Invite Audit Trail Helper
 * Logs invite-related events for security and compliance
 */

import { createClient } from "@/lib/supabase-server";
import { transformToSnake } from "@/lib/case-transform";

export type InviteAuditEvent =
  | "created"
  | "sent"
  | "resent"
  | "accepted"
  | "verified"
  | "expired"
  | "cancelled"
  | "email_changed"
  | "suspicious_activity";

interface LogInviteEventParams {
  inviteId: string;
  eventType: InviteAuditEvent;
  actorId?: string;
  targetId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Log an invite-related event to the audit trail
 */
export async function logInviteEvent({
  inviteId,
  eventType,
  actorId,
  targetId,
  ipAddress,
  userAgent,
  metadata,
}: LogInviteEventParams): Promise<void> {
  try {
    const supabase = createClient();

    const { error } = await supabase.from("invite_audit_log").insert(
      transformToSnake({
        inviteId,
        eventType,
        actorId: actorId || null,
        targetId: targetId || null,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        metadata: metadata || null,
      })
    );

    if (error) {
      console.error("[AUDIT] Failed to log invite event:", error);
      // Don't throw - audit logging failures shouldn't break the app
    } else {
      console.log(
        `[AUDIT] Logged invite event: ${eventType} for invite ${inviteId}`
      );
    }
  } catch (error) {
    console.error("[AUDIT] Error logging invite event:", error);
    // Don't throw - audit logging is non-critical
  }
}

/**
 * Log suspicious activity related to an invite
 */
export async function logSuspiciousInviteActivity({
  inviteId,
  reason,
  ipAddress,
  userAgent,
  details,
}: {
  inviteId: string;
  reason: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, unknown>;
}): Promise<void> {
  await logInviteEvent({
    inviteId,
    eventType: "suspicious_activity",
    ipAddress,
    userAgent,
    metadata: {
      reason,
      timestamp: new Date().toISOString(),
      ...details,
    },
  });
}
