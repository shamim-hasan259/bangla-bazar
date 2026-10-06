import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import prisma from "@/index";

// In-Memory Rate Limiter for Admin Authentication attempts
interface RateLimitRecord {
  attempts: number;
  firstAttemptTime: number;
  lastAttemptTime: number;
}

const loginAttemptsStore = new Map<string, RateLimitRecord>();

const MAX_FAILED_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Checks if the identifier (email/IP) has exceeded the max login attempts.
 */
export function checkAdminLoginRateLimit(identifier: string): {
  isAllowed: boolean;
  remainingAttempts: number;
  retryAfterSeconds: number;
} {
  const cleanId = identifier.trim().toLowerCase();
  const now = Date.now();
  const record = loginAttemptsStore.get(cleanId);

  if (!record) {
    return { isAllowed: true, remainingAttempts: MAX_FAILED_ATTEMPTS, retryAfterSeconds: 0 };
  }

  // Check if the rate-limit window has expired
  if (now - record.firstAttemptTime > RATE_LIMIT_WINDOW_MS) {
    loginAttemptsStore.delete(cleanId);
    return { isAllowed: true, remainingAttempts: MAX_FAILED_ATTEMPTS, retryAfterSeconds: 0 };
  }

  if (record.attempts >= MAX_FAILED_ATTEMPTS) {
    const retryAfterMs = record.firstAttemptTime + RATE_LIMIT_WINDOW_MS - now;
    const retryAfterSeconds = Math.max(1, Math.ceil(retryAfterMs / 1000));
    return { isAllowed: false, remainingAttempts: 0, retryAfterSeconds };
  }

  return {
    isAllowed: true,
    remainingAttempts: MAX_FAILED_ATTEMPTS - record.attempts,
    retryAfterSeconds: 0,
  };
}

/**
 * Records a failed login attempt for the identifier.
 */
export function recordAdminFailedAttempt(identifier: string) {
  const cleanId = identifier.trim().toLowerCase();
  const now = Date.now();
  const record = loginAttemptsStore.get(cleanId);

  if (!record || now - record.firstAttemptTime > RATE_LIMIT_WINDOW_MS) {
    loginAttemptsStore.set(cleanId, {
      attempts: 1,
      firstAttemptTime: now,
      lastAttemptTime: now,
    });
  } else {
    record.attempts += 1;
    record.lastAttemptTime = now;
    loginAttemptsStore.set(cleanId, record);
  }
}

/**
 * Resets the rate limit counter upon successful login.
 */
export function resetAdminRateLimit(identifier: string) {
  const cleanId = identifier.trim().toLowerCase();
  loginAttemptsStore.delete(cleanId);
}

/**
 * Server-side helper to verify Admin session and active status in DB.
 * Used to protect API routes and Server Components.
 */
export async function verifyAdminRequest() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Unauthorized", message: "Authentication required" },
        { status: 401 }
      ),
      session: null,
      admin: null,
    };
  }

  const user = session.user as any;
  const userRole = String(user.role || user.type || "").toLowerCase();

  if (userRole !== "admin") {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Forbidden", message: "Access restricted to Admin" },
        { status: 403 }
      ),
      session: null,
      admin: null,
    };
  }

  // Verify in MongoDB Admin collection that the account is active
  try {
    const admin = await prisma.admin.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });

    if (!admin || admin.status.toLowerCase() !== "active") {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: "Forbidden", message: "Admin account is inactive or not found" },
          { status: 403 }
        ),
        session: null,
        admin: null,
      };
    }

    return {
      authorized: true,
      response: null,
      session,
      admin,
    };
  } catch (error) {
    console.error("verifyAdminRequest DB error:", error);
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "InternalServerError", message: "Error verifying admin privileges" },
        { status: 500 }
      ),
      session: null,
      admin: null,
    };
  }
}
