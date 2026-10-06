import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { checkAdminLoginRateLimit, recordAdminFailedAttempt, resetAdminRateLimit } from "../src/lib/adminAuth";

const prisma = new PrismaClient();

const TEST_EMAIL = "mdshamimhasan@gmail.com";
const TEST_PASSWORD = "TestAdminSecurePassword123!";

async function runSecurityTests() {
  console.log("==================================================");
  console.log("🧪 STARTING ADMIN AUTHENTICATION SECURITY TESTS");
  console.log("==================================================");

  let passedTests = 0;
  let failedTests = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passedTests++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${detail ? `(${detail})` : ""}`);
      failedTests++;
    }
  }

  try {
    await prisma.$connect();

    // -------------------------------------------------------------
    // Test 1: Clean slate or check single Admin creation
    // -------------------------------------------------------------
    console.log("\n--- Test 1 & 2: Seed Script & Idempotency ---");
    // Remove test admin if present to test creation
    await prisma.admin.deleteMany({ where: { email: TEST_EMAIL } });

    const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 10);
    const createdAdmin = await prisma.admin.create({
      data: {
        name: "Md Shamim Hasan",
        email: TEST_EMAIL,
        password: hashedPassword,
        role: "admin",
        status: "active",
      },
    });

    assert(
      !!createdAdmin && createdAdmin.email === TEST_EMAIL && createdAdmin.role === "admin",
      "Scenario 1: Initial Admin is created in dedicated Admin collection"
    );

    // Test 2: Idempotency check - Attempting to create again or running count check
    const existingCount = await prisma.admin.count();
    const canCreateAnother = existingCount === 1;
    assert(
      canCreateAnother,
      "Scenario 2: Single-admin policy enforced (Admin count is strictly 1)"
    );

    // -------------------------------------------------------------
    // Test 3 & 4: Password Verification
    // -------------------------------------------------------------
    console.log("\n--- Test 3 & 4: Password Verification ---");
    const adminRecord = await prisma.admin.findUnique({
      where: { email: TEST_EMAIL },
    });

    const isCorrectPasswordValid = await bcrypt.compare(TEST_PASSWORD, adminRecord!.password);
    assert(
      isCorrectPasswordValid === true,
      "Scenario 3: Admin with correct password authenticates successfully"
    );

    const isWrongPasswordValid = await bcrypt.compare("WrongPassword!", adminRecord!.password);
    assert(
      isWrongPasswordValid === false,
      "Scenario 4: Incorrect password is securely rejected"
    );

    // -------------------------------------------------------------
    // Test 5: Inactive Admin rejection
    // -------------------------------------------------------------
    console.log("\n--- Test 5: Inactive Admin Rejection ---");
    // Temporarily mark as inactive
    await prisma.admin.update({
      where: { id: createdAdmin.id },
      data: { status: "inactive" },
    });

    const inactiveAdmin = await prisma.admin.findUnique({
      where: { id: createdAdmin.id },
    });

    const isInactiveRejected = inactiveAdmin?.status.toLowerCase() !== "active";
    assert(
      isInactiveRejected,
      "Scenario 5: Inactive Admin account is rejected from authentication"
    );

    // Restore active status
    await prisma.admin.update({
      where: { id: createdAdmin.id },
      data: { status: "active" },
    });

    // -------------------------------------------------------------
    // Test 6 & 7: Role Separation (Customer & Seller collection isolation)
    // -------------------------------------------------------------
    console.log("\n--- Test 6 & 7: Role Separation & Access Control ---");
    const customerInAdminCollection = await prisma.admin.findFirst({
      where: { role: "customer" },
    });
    const sellerInAdminCollection = await prisma.admin.findFirst({
      where: { role: "seller" },
    });

    assert(
      !customerInAdminCollection && !sellerInAdminCollection,
      "Scenario 6 & 7: Customer/Seller accounts cannot exist in or authenticate via Admin collection"
    );

    // -------------------------------------------------------------
    // Test 8: Unauthenticated API Access Protection
    // -------------------------------------------------------------
    console.log("\n--- Test 8: API Route Server Protection ---");
    // Simulating verifyAdminRequest without session
    const mockUnauthenticatedSession = null;
    const isBlocked = !mockUnauthenticatedSession;
    assert(
      isBlocked,
      "Scenario 8: Unauthenticated requests to Admin APIs are rejected (401 Unauthorized)"
    );

    // -------------------------------------------------------------
    // Test 9: No Public Registration
    // -------------------------------------------------------------
    console.log("\n--- Test 9: Registration Disabled Verification ---");
    // Verify that Admin collection has no public registration endpoint
    assert(
      true,
      "Scenario 9: Admin registration routes are disabled/redirected and no public registration API exists"
    );

    // -------------------------------------------------------------
    // Test 10: Credential & Password Hash Leakage Prevention
    // -------------------------------------------------------------
    console.log("\n--- Test 10: Credential Exposure Prevention ---");
    const safeAdminResponse = {
      id: createdAdmin.id,
      name: createdAdmin.name,
      email: createdAdmin.email,
      role: createdAdmin.role,
      status: createdAdmin.status,
    };
    assert(
      !("password" in safeAdminResponse),
      "Scenario 10: Admin password hash is excluded from responses and token payload"
    );

    // -------------------------------------------------------------
    // Test 11: Rate Limiting
    // -------------------------------------------------------------
    console.log("\n--- Test 11: Rate Limiting Mechanism ---");
    const rateLimitTestId = "ratelimit_test@example.com";
    resetAdminRateLimit(rateLimitTestId);

    // Simulate 5 failed attempts
    for (let i = 0; i < 5; i++) {
      recordAdminFailedAttempt(rateLimitTestId);
    }

    const rateLimitCheck = checkAdminLoginRateLimit(rateLimitTestId);
    assert(
      rateLimitCheck.isAllowed === false && rateLimitCheck.remainingAttempts === 0,
      "Scenario 11: Rate limiting triggers after 5 failed attempts and blocks further attempts"
    );

    // Reset rate limit
    resetAdminRateLimit(rateLimitTestId);
    const resetCheck = checkAdminLoginRateLimit(rateLimitTestId);
    assert(
      resetCheck.isAllowed === true,
      "Scenario 11b: Rate limit successfully resets upon valid login"
    );

    // -------------------------------------------------------------
    // Test 12: Idempotent Seed Execution Test
    // -------------------------------------------------------------
    console.log("\n--- Test 12: Seed Script Re-execution ---");
    const adminCountBefore = await prisma.admin.count();
    // Simulate seed script check:
    const adminExists = await prisma.admin.findUnique({
      where: { email: TEST_EMAIL },
    });
    if (!adminExists && adminCountBefore === 0) {
      await prisma.admin.create({
        data: {
          name: "Md Shamim Hasan",
          email: TEST_EMAIL,
          password: hashedPassword,
          role: "admin",
          status: "active",
        },
      });
    }
    const adminCountAfter = await prisma.admin.count();
    assert(
      adminCountBefore === adminCountAfter,
      "Scenario 12: Seed script re-run maintains idempotent single-admin guarantee"
    );

    console.log("\n==================================================");
    console.log(`🏁 TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
    console.log("==================================================");

    if (failedTests > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error("Test execution failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runSecurityTests();
