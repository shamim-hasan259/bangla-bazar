import { NextRequest, NextResponse } from "next/server";
import {
  isAdminSetupCompleted,
  executeOneTimeAdminSetup,
  verifyAdminSetupToken,
} from "@/lib/adminSetup";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/setup
 * Public status check to determine if the one-time admin setup is still available.
 * Never leaks tokens or private credentials.
 */
export async function GET() {
  try {
    const isSetupComplete = await isAdminSetupCompleted();

    return NextResponse.json(
      {
        isSetupComplete,
        available: !isSetupComplete,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/admin/setup error:", error);
    return NextResponse.json(
      {
        isSetupComplete: true,
        available: false,
        error: "Unable to verify setup status",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/setup
 * Performs the one-time creation of the initial website Administrator account.
 * Requires a valid ADMIN_SETUP_TOKEN environment variable.
 * Permanently locks setup after first execution.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Guard check: Is setup already completed?
    const alreadyCompleted = await isAdminSetupCompleted();
    if (alreadyCompleted) {
      return NextResponse.json(
        {
          error: "Forbidden",
          message: "Admin setup has already been completed and is permanently closed.",
        },
        { status: 403 }
      );
    }

    // 2. Parse request body
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: "BadRequest", message: "Invalid JSON request payload." },
        { status: 400 }
      );
    }

    const { name, email, password, confirmPassword, setupToken } = body;

    // 3. Basic validation
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "ValidationError", message: "Administrator name is required." },
        { status: 422 }
      );
    }

    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { error: "ValidationError", message: "Administrator email is required." },
        { status: 422 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        {
          error: "ValidationError",
          message: "Password must be at least 8 characters in length.",
        },
        { status: 422 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "ValidationError", message: "Passwords do not match." },
        { status: 422 }
      );
    }

    if (!setupToken || typeof setupToken !== "string" || !setupToken.trim()) {
      return NextResponse.json(
        { error: "ValidationError", message: "Setup Token is required." },
        { status: 422 }
      );
    }

    // 4. Token authorization check
    const isTokenValid = verifyAdminSetupToken(setupToken);
    if (!isTokenValid) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message:
            "Invalid setup token. Please check your ADMIN_SETUP_TOKEN environment variable.",
        },
        { status: 401 }
      );
    }

    // 5. Execute transactional setup
    const setupResult = await executeOneTimeAdminSetup({
      name,
      email,
      password,
      setupToken,
    });

    if (!setupResult.success) {
      return NextResponse.json(
        {
          error: "SetupFailed",
          message: setupResult.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: setupResult.message,
        admin: setupResult.admin,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/admin/setup error:", error);
    return NextResponse.json(
      {
        error: "InternalServerError",
        message: error?.message || "An unexpected error occurred during setup.",
      },
      { status: 500 }
    );
  }
}
