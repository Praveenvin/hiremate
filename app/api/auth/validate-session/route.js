import { NextResponse } from "next/server";
import { db } from "@/utils/db";
import { User } from "@/utils/schema";
import { eq } from "drizzle-orm";

export async function POST(request) {
  try {
    const { sessionToken } = await request.json();

    if (!sessionToken) {
      return NextResponse.json(
        { error: "Session token required" },
        { status: 400 }
      );
    }

    // Expected format: session_<userId>_<timestamp>
    const parts = sessionToken.split("_");

    if (parts.length !== 3 || parts[0] !== "session") {
      return NextResponse.json(
        { error: "Invalid session token format" },
        { status: 401 }
      );
    }

    const userId = Number(parts[1]);
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: "Invalid session token" },
        { status: 401 }
      );
    }

    // Fetch user by ID
    const userRows = await db
      .select()
      .from(User)
      .where(eq(User.id, userId))
      .limit(1);

    if (userRows.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 401 }
      );
    }

    const user = userRows[0];

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isFirstLogin: user.isFirstLogin,
      },
    });
  } catch (error) {
    console.error("❌ Validate session error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
