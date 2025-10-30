import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { User } from "@/types";

// Mock user database - in production, this would be a real database
const mockUsers: (User & { password: string })[] = [
  {
    id: "1",
    email: "coach@example.com",
    name: "Coach Smith",
    role: "coach",
    groupIds: [],
    password: "coach123",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    email: "athlete@example.com",
    name: "John Athlete",
    role: "athlete",
    groupIds: ["1"], // Football Linemen
    coachId: "1",
    password: "athlete123",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    email: "sarah@example.com",
    name: "Sarah Miller",
    role: "athlete",
    groupIds: ["3"], // Volleyball Girls
    coachId: "1",
    password: "sarah123",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "4",
    email: "mike@example.com",
    name: "Mike Johnson",
    role: "athlete",
    groupIds: ["1"], // Football Linemen
    coachId: "1",
    password: "mike123",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user in mock database
    const user = mockUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Remove password from user object
    const userWithoutPassword: User = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      groupIds: user.groupIds,
      coachId: user.coachId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return NextResponse.json({
      success: true,
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET endpoint to provide demo credentials for testing
export async function GET() {
  return NextResponse.json({
    demoCredentials: [
      {
        role: "coach",
        email: "coach@example.com",
        password: "coach123",
        description: "Full access to group management and calendar",
      },
      {
        role: "athlete",
        email: "athlete@example.com",
        password: "athlete123",
        description: "Access to personal workouts and progress",
      },
      {
        role: "athlete",
        email: "sarah@example.com",
        password: "sarah123",
        description: "Volleyball Girls team member",
      },
      {
        role: "athlete",
        email: "mike@example.com",
        password: "mike123",
        description: "Football Linemen team member",
      },
    ],
  });
}
