import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/auth-server";

type CoachRecord = {
  id: string;
  role?: string | null;
  name?: string | null;
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  coach_welcome_message?: string | null;
  coach_settings?: Record<string, unknown> | null;
  settings?: Record<string, unknown> | null;
  coach_profile?: Record<string, unknown> | null;
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const coachId = searchParams.get("coachId");

  if (!coachId) {
    return NextResponse.json(
      { success: false, error: "coachId query parameter is required" },
      { status: 400 }
    );
  }

  try {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", coachId)
      .maybeSingle();

    if (error) {
      console.error("[COACH_SETTINGS_PUBLIC] Supabase error:", error);
      return NextResponse.json(
        { success: false, error: "Unable to load coach profile" },
        { status: 500 }
      );
    }

    const coach = data as CoachRecord | null;

    if (!coach || !["coach", "admin"].includes(coach.role ?? "")) {
      return NextResponse.json(
        { success: false, error: "Coach not found" },
        { status: 404 }
      );
    }

    const coachName =
      [coach.first_name, coach.last_name].filter(Boolean).join(" ").trim() ||
      coach.full_name ||
      coach.name ||
      "Coach";

    const welcomeMessage =
      extractWelcomeMessage(coach) ||
      `Coach ${coachName} is excited to have you back. Let's crush today's training.`;

    return NextResponse.json({
      success: true,
      settings: {
        coach_id: coach.id,
        coach_name: coachName,
        welcome_message: welcomeMessage,
      },
    });
  } catch (error) {
    console.error("[COACH_SETTINGS_PUBLIC] Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load coach settings" },
      { status: 500 }
    );
  }
}

function extractWelcomeMessage(coach: CoachRecord): string | null {
  const directMessage = coach.coach_welcome_message?.trim();
  if (directMessage) {
    return directMessage;
  }

  const containers: Array<Record<string, unknown> | null | undefined> = [
    coach.coach_settings,
    coach.settings,
    coach.coach_profile,
  ];

  for (const container of containers) {
    const message = extractFromContainer(container);
    if (message) {
      return message;
    }
  }

  return null;
}

function extractFromContainer(
  container: Record<string, unknown> | null | undefined
): string | null {
  if (!container) return null;

  const snake = container["welcome_message"];
  if (typeof snake === "string" && snake.trim()) {
    return snake.trim();
  }

  const camel = container["welcomeMessage"];
  if (typeof camel === "string" && camel.trim()) {
    return camel.trim();
  }

  return null;
}
