import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

// Debug endpoint to check auth status
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    
    console.log("🔍 Auth Debug:");
    console.log("Authorization header:", authHeader ? "Present" : "Missing");
    
    if (authHeader) {
      console.log("Header value:", authHeader.substring(0, 20) + "...");
    }

    const auth = await verifyToken(request);
    
    console.log("Auth result:", {
      success: auth.success,
      user: auth.user ? auth.user.email : null,
      error: auth.error,
    });

    return NextResponse.json({
      success: true,
      data: {
        hasAuthHeader: !!authHeader,
        authHeaderPreview: authHeader?.substring(0, 20) + "...",
        authVerification: {
          success: auth.success,
          userId: auth.user?.userId,
          email: auth.user?.email,
          role: auth.user?.role,
          error: auth.error,
        },
      },
    });
  } catch (error) {
    console.error("Debug endpoint error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Debug endpoint failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
