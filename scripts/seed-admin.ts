import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

// Support both DATABASE_URL and MONGODB_URI
if (!process.env.DATABASE_URL && process.env.MONGODB_URI) {
  process.env.DATABASE_URL = process.env.MONGODB_URI;
}

const prisma = new PrismaClient();

const ADMIN_NAME = "Md Shamim Hasan";
const ADMIN_EMAIL = "mdshamimhasan791@gmail.com";
const ADMIN_ROLE = "admin";
const ADMIN_STATUS = "active";

async function seedAdmin() {
  console.log("==========================================");
  console.log(" Bangla Bazar - Admin Initialization");
  console.log("==========================================");

  const rawPassword = process.env.ADMIN_PASSWORD;

  if (!rawPassword || rawPassword.trim() === "") {
    console.error("ERROR: ADMIN_PASSWORD environment variable is not set or empty.");
    console.error("Please provide ADMIN_PASSWORD when running the seed script:");
    console.error("  Example (Windows PowerShell): $env:ADMIN_PASSWORD=\"YourSecurePassword\"; npm run seed:admin");
    console.error("  Example (Linux/macOS): ADMIN_PASSWORD=\"YourSecurePassword\" npm run seed:admin");
    process.exit(1);
  }

  if (rawPassword.length < 8) {
    console.error("❌ ERROR: ADMIN_PASSWORD must be at least 8 characters long for security.");
    process.exit(1);
  }

  try {
    console.log("📡 Connecting to database...");
    await prisma.$connect();
    console.log("✅ Database connected successfully.");

    // Check if any Admin already exists (system allows only ONE Admin account)
    const existingAdminByEmail = await prisma.admin.findUnique({
      where: { email: ADMIN_EMAIL.toLowerCase() },
    });

    const totalAdminsCount = await prisma.admin.count();

    if (existingAdminByEmail || totalAdminsCount > 0) {
      console.log("ℹ️  An Admin account already exists in the system.");
      if (existingAdminByEmail) {
        console.log(`ℹ️  Existing Admin Email: ${existingAdminByEmail.email}`);
        console.log(`ℹ️  Status: ${existingAdminByEmail.status}`);
      } else {
        console.log(`ℹ️  Total Admin accounts present: ${totalAdminsCount}`);
      }
      console.log("🛡️  Single-admin policy enforced: Skipping creation without resetting existing password.");
      console.log("==========================================");
      return;
    }

    console.log("🔐 Hashing password securely with bcrypt...");
    const hashedPassword = await bcrypt.hash(rawPassword.trim(), 10);

    console.log(`👤 Creating single Admin account for: ${ADMIN_NAME} (${ADMIN_EMAIL})...`);
    const newAdmin = await prisma.admin.create({
      data: {
        name: ADMIN_NAME,
        email: ADMIN_EMAIL.toLowerCase(),
        password: hashedPassword,
        role: ADMIN_ROLE,
        status: ADMIN_STATUS,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
    console.log("✅ Admin account created successfully!");
    console.log(`   ID: ${newAdmin.id}`);
    console.log(`   Name: ${newAdmin.name}`);
    console.log(`   Email: ${newAdmin.email}`);
    console.log(`   Role: ${newAdmin.role}`);
    console.log(`   Status: ${newAdmin.status}`);
    console.log("==========================================");
  } catch (error: any) {
    console.error("❌ Database or seed operation failed:", error?.message || error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log("🔌 Database connection closed.");
  }
}

seedAdmin();
