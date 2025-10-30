import { NextRequest, NextResponse } from "next/server";
import { verifyToken, canManageGroups, canViewAllAthletes } from "@/lib/auth";
import { AthleteGroup } from "@/types";

// Mock groups database - in production, this would be a real database
const mockGroups: AthleteGroup[] = [
  {
    id: "1",
    name: "Football Linemen",
    description: "Offensive and defensive linemen",
    sport: "Football",
    category: "Linemen",
    coachId: "1",
    athleteIds: ["2", "4"],
    color: "#ff6b35",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    name: "Football Receivers",
    description: "Wide receivers and tight ends",
    sport: "Football",
    category: "Receivers",
    coachId: "1",
    athleteIds: [],
    color: "#00d4aa",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    name: "Volleyball Girls",
    description: "Girls varsity volleyball team",
    sport: "Volleyball",
    category: "Girls",
    coachId: "1",
    athleteIds: ["3"],
    color: "#8b5cf6",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "4",
    name: "Cross Country Boys",
    description: "Boys cross country team",
    sport: "Cross Country",
    category: "Boys",
    coachId: "1",
    athleteIds: [],
    color: "#3b82f6",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// GET /api/groups - Get all groups (coaches) or user's groups (athletes)
export async function GET(request: NextRequest) {
  try {
    const auth = verifyToken(request);

    if (!auth.success || !auth.user) {
      return NextResponse.json(
        { error: auth.error || "Authentication required" },
        { status: 401 }
      );
    }

    // Coaches can see all groups, athletes only see their groups
    if (canViewAllAthletes(auth.user)) {
      return NextResponse.json({
        success: true,
        groups: mockGroups,
      });
    } else {
      // For athletes, we would filter by their groupIds
      // This would require getting the user's groups from the database
      const userGroups = mockGroups.filter((group) =>
        group.athleteIds.includes(auth.user!.userId)
      );

      return NextResponse.json({
        success: true,
        groups: userGroups,
      });
    }
  } catch (error) {
    console.error("Groups GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/groups - Create new group (coaches only)
export async function POST(request: NextRequest) {
  try {
    const auth = verifyToken(request);

    if (!auth.success || !auth.user) {
      return NextResponse.json(
        { error: auth.error || "Authentication required" },
        { status: 401 }
      );
    }

    if (!canManageGroups(auth.user)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const { name, description, sport, category, color, athleteIds } =
      await request.json();

    if (!name || !sport) {
      return NextResponse.json(
        { error: "Name and sport are required" },
        { status: 400 }
      );
    }

    const newGroup: AthleteGroup = {
      id: `group-${Date.now()}`,
      name,
      description,
      sport,
      category,
      coachId: auth.user.userId,
      athleteIds: athleteIds || [],
      color: color || "#3b82f6",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // In production, save to database
    mockGroups.push(newGroup);

    return NextResponse.json({
      success: true,
      group: newGroup,
    });
  } catch (error) {
    console.error("Groups POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
