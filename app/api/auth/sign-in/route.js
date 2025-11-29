import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/utils/db";
import { User } from "@/utils/schema";
import { eq } from "drizzle-orm";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Fetch user
    const result = await db.select().from(User).where(eq(User.email, email)).limit(1);

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const user = result[0];

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Generate a simple session token (use JWT later if needed)
    const sessionToken = `session_${user.id}_${Date.now()}`;

    return NextResponse.json({
      sessionToken,
      isFirstLogin: user.isFirstLogin,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    console.error("❌ Sign-in Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
