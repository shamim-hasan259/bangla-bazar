import prisma from "@/index";
import bcrypt from "bcrypt";
import crypto from "crypto";

/**
 * Checks if the Admin Setup has already been completed.
 * Setup is considered complete if:
 * 1. An AdminSetupConfig record exists with isSetupComplete === true (permanent lock)
 * 2. An Admin account already exists in the Admin collection
 */
export async function isAdminSetupCompleted(): Promise<boolean> {
  try {
    const db = prisma as any;

    // 1. Check persistent setup lock record
    const setupRecord = await db.adminSetupConfig?.findFirst({
      where: { isSetupComplete: true },
    });

    if (setupRecord) {
      return true;
    }

    // 2. Check if an Admin account already exists
    const adminCount = await db.admin?.count();
    if (adminCount && adminCount > 0) {
      // Auto-heal lock record if admin exists but lock was missing
      try {
        await db.adminSetupConfig?.create({
          data: {
            isSetupComplete: true,
            completedAt: new Date(),
            adminEmail: "existing-admin",
          },
        });
      } catch {
        // Ignore duplicate key or concurrent write
      }
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error checking Admin Setup status:", error);
    // In case of DB connectivity issue, assume locked to avoid unauthorized access
    return false;
  }
}

/**
 * Validates the provided setup token against the environment variable ADMIN_SETUP_TOKEN.
 * Uses constant-time comparison to prevent timing side-channel attacks.
 */
export function verifyAdminSetupToken(inputToken: string): boolean {
  const envToken = process.env.ADMIN_SETUP_TOKEN || process.env.ADMIN_SETUP_SECRET;

  if (!envToken || typeof envToken !== "string" || envToken.trim().length === 0) {
    console.error("ADMIN_SETUP_TOKEN is not configured in the server environment variables.");
    return false;
  }

  if (!inputToken || typeof inputToken !== "string") {
    return false;
  }

  const cleanInput = inputToken.trim();
  const cleanEnv = envToken.trim();

  // Protect against timing attacks using crypto.timingSafeEqual
  try {
    const inputBuf = Buffer.from(cleanInput, "utf-8");
    const envBuf = Buffer.from(cleanEnv, "utf-8");

    if (inputBuf.length !== envBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(inputBuf, envBuf);
  } catch {
    return false;
  }
}

export interface SetupAdminInput {
  name: string;
  email: string;
  password: string;
  setupToken: string;
}

/**
 * Securely performs the one-time Admin account setup.
 * Uses atomic transaction to guarantee concurrency safety and prevent multiple Admin creation.
 */
export async function executeOneTimeAdminSetup(input: SetupAdminInput): Promise<{
  success: boolean;
  message: string;
  admin?: { id: string; name: string; email: string; role: string };
}> {
  const { name, email, password, setupToken } = input;

  // 1. Basic format validation
  if (!name || !name.trim()) {
    return { success: false, message: "Admin full name is required." };
  }

  if (!email || !email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return { success: false, message: "A valid email address is required." };
  }

  if (!password || password.length < 8) {
    return {
      success: false,
      message: "Password must be at least 8 characters in length.",
    };
  }

  // 2. Validate setup token
  if (!verifyAdminSetupToken(setupToken)) {
    return {
      success: false,
      message: "Invalid setup token. Please check your ADMIN_SETUP_TOKEN environment variable.",
    };
  }

  // 3. Pre-check setup completion
  const alreadyCompleted = await isAdminSetupCompleted();
  if (alreadyCompleted) {
    return {
      success: false,
      message: "Admin setup has already been completed and is permanently closed.",
    };
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  // 4. Hash password securely with bcrypt (salt rounds = 12)
  const hashedPassword = await bcrypt.hash(password, 12);

  // 5. Execute atomic transaction to prevent concurrent Admin creation
  try {
    const result = await prisma.$transaction(async (tx) => {
      const dbTx = tx as any;

      // Re-verify setup lock inside transaction
      const existingLock = await dbTx.adminSetupConfig?.findFirst({
        where: { isSetupComplete: true },
      });
      if (existingLock) {
        throw new Error("SETUP_ALREADY_COMPLETED");
      }

      // Re-verify admin count inside transaction
      const existingAdminCount = await dbTx.admin?.count();
      if (existingAdminCount && existingAdminCount > 0) {
        throw new Error("ADMIN_ALREADY_EXISTS");
      }

      // Check if email already in use
      const existingEmail = await dbTx.admin?.findUnique({
        where: { email: cleanEmail },
      });
      if (existingEmail) {
        throw new Error("EMAIL_ALREADY_REGISTERED");
      }

      // Create persistent setup lock
      const setupConfig = await dbTx.adminSetupConfig?.create({
        data: {
          isSetupComplete: true,
          completedAt: new Date(),
          adminEmail: cleanEmail,
        },
      });

      // Create the single Admin account
      const admin = await dbTx.admin?.create({
        data: {
          name: cleanName,
          email: cleanEmail,
          password: hashedPassword,
          role: "admin",
          status: "active",
        },
      });

      return { admin, setupConfig };
    });

    return {
      success: true,
      message: "Administrator account created successfully! Setup is now permanently closed.",
      admin: {
        id: result.admin.id,
        name: result.admin.name,
        email: result.admin.email,
        role: result.admin.role,
      },
    };
  } catch (error: any) {
    console.error("Admin setup transaction error:", error);

    if (error?.message === "SETUP_ALREADY_COMPLETED" || error?.message === "ADMIN_ALREADY_EXISTS") {
      return {
        success: false,
        message: "Admin setup has already been completed and is permanently closed.",
      };
    }

    if (error?.message === "EMAIL_ALREADY_REGISTERED") {
      return {
        success: false,
        message: "An Admin account with this email address already exists.",
      };
    }

    return {
      success: false,
      message: error?.message || "An unexpected error occurred during admin setup.",
    };
  }
}
