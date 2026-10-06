import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/adminAuth";
import prisma from "@/index";
import bcrypt from "bcrypt";

export const dynamic = "force-dynamic";

/**
 * Helper to fetch Admin document directly from MongoDB
 */
async function getAdminDoc(adminId: string, adminEmail?: string) {
  try {
    const rawFind = (await prisma.$runCommandRaw({
      find: "Admin",
      filter: {
        $or: [
          ...(adminId ? [{ _id: { $oid: adminId } }] : []),
          ...(adminEmail ? [{ email: adminEmail }] : []),
        ],
      },
      limit: 1,
    })) as any;

    const doc = rawFind?.cursor?.firstBatch?.[0];
    if (doc) {
      const id = typeof doc._id === "object" ? doc._id.$oid || String(doc._id) : String(doc._id);
      return {
        id,
        name: doc.name || "",
        email: doc.email || "",
        phone: doc.phone || "",
        photo: doc.photo || "",
        role: doc.role || "admin",
        status: doc.status || "active",
        createdAt: doc.createdAt?.$date || doc.createdAt || new Date(),
        updatedAt: doc.updatedAt?.$date || doc.updatedAt || new Date(),
        password: doc.password || "",
      };
    }
  } catch (rawError) {
    console.warn("Raw find fallback to prisma.admin:", rawError);
  }

  // Fallback to prisma.admin.findFirst
  const db = prisma as any;
  const admin = await db.admin?.findFirst({
    where: {
      OR: [
        ...(adminId ? [{ id: adminId }] : []),
        ...(adminEmail ? [{ email: adminEmail }] : []),
      ],
    },
  });

  return admin;
}

/**
 * GET /api/admin/profile
 * Retrieves full profile details of the authenticated administrator.
 */
export async function GET() {
  try {
    const auth = await verifyAdminRequest();
    if (!auth.authorized || !auth.session?.user) {
      return auth.response;
    }

    const userId = (auth.session.user as any).id;
    const userEmail = (auth.session.user as any).email;

    const admin = await getAdminDoc(userId, userEmail);

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Administrator profile not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone || null,
        photo: admin.photo || null,
        role: admin.role,
        status: admin.status,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt,
      },
    });
  } catch (error: any) {
    console.error("GET /api/admin/profile error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to retrieve administrator profile.",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/profile
 * Updates administrator personal info, profile photo, and password.
 */
export async function PUT(req: NextRequest) {
  try {
    const auth = await verifyAdminRequest();
    if (!auth.authorized || !auth.session?.user) {
      return auth.response;
    }

    const userId = (auth.session.user as any).id;
    const userEmail = (auth.session.user as any).email;

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, message: "Invalid JSON request payload." },
        { status: 400 }
      );
    }

    const { name, email, phone, photo, currentPassword, newPassword } = body;

    const currentAdmin = await getAdminDoc(userId, userEmail);
    if (!currentAdmin) {
      return NextResponse.json(
        { success: false, message: "Administrator account not found." },
        { status: 404 }
      );
    }

    const updateData: Record<string, any> = {};

    // 1. Name update
    if (name !== undefined) {
      if (!name || typeof name !== "string" || !name.trim()) {
        return NextResponse.json(
          { success: false, message: "Full Name cannot be empty." },
          { status: 422 }
        );
      }
      updateData.name = name.trim();
    }

    // 2. Email update
    if (email !== undefined) {
      const cleanEmail = String(email).trim().toLowerCase();
      if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return NextResponse.json(
          { success: false, message: "Please provide a valid email address." },
          { status: 422 }
        );
      }

      if (cleanEmail !== currentAdmin.email) {
        // Check if new email is taken by another admin
        const db = prisma as any;
        const existingWithEmail = await db.admin?.findUnique({
          where: { email: cleanEmail },
        });

        if (existingWithEmail && existingWithEmail.id !== currentAdmin.id) {
          return NextResponse.json(
            { success: false, message: "This email is already in use by another administrator." },
            { status: 409 }
          );
        }

        updateData.email = cleanEmail;
      }
    }

    // 3. Phone update
    if (phone !== undefined) {
      updateData.phone = typeof phone === "string" ? phone.trim() : null;
    }

    // 4. Photo update
    if (photo !== undefined) {
      updateData.photo = typeof photo === "string" ? photo.trim() : null;
    }

    // 5. Password update
    if (newPassword) {
      if (typeof newPassword !== "string" || newPassword.length < 8) {
        return NextResponse.json(
          {
            success: false,
            message: "New password must be at least 8 characters long.",
          },
          { status: 422 }
        );
      }

      if (!currentPassword) {
        return NextResponse.json(
          {
            success: false,
            message: "Current password is required to set a new password.",
          },
          { status: 422 }
        );
      }

      const isCurrentCorrect = await bcrypt.compare(
        currentPassword,
        currentAdmin.password
      );

      if (!isCurrentCorrect) {
        return NextResponse.json(
          { success: false, message: "Current password is incorrect." },
          { status: 403 }
        );
      }

      updateData.password = await bcrypt.hash(newPassword, 12);
    }

    // Update MongoDB directly to bypass Prisma client type differences
    try {
      await prisma.$runCommandRaw({
        update: "Admin",
        updates: [
          {
            q: { _id: { $oid: currentAdmin.id } },
            u: {
              ...(Object.keys(updateData).length > 0 ? { $set: updateData } : {}),
              $currentDate: { updatedAt: { $type: "date" } },
            },
          },
        ],
      });
    } catch (updateRawErr) {
      console.warn("Direct raw update failed, attempting standard update:", updateRawErr);
      const db = prisma as any;
      const safeData = { ...updateData };
      delete safeData.phone;
      delete safeData.photo;
      await db.admin?.update({
        where: { id: currentAdmin.id },
        data: safeData,
      });
    }

    // Fetch updated document
    const updatedAdmin = await getAdminDoc(currentAdmin.id);

    return NextResponse.json({
      success: true,
      message: "Admin profile updated successfully.",
      admin: {
        id: updatedAdmin?.id || currentAdmin.id,
        name: updateData.name ?? currentAdmin.name,
        email: updateData.email ?? currentAdmin.email,
        phone: updateData.phone ?? currentAdmin.phone ?? null,
        photo: updateData.photo ?? currentAdmin.photo ?? null,
        role: updatedAdmin?.role || currentAdmin.role,
        status: updatedAdmin?.status || currentAdmin.status,
        createdAt: updatedAdmin?.createdAt || currentAdmin.createdAt,
        updatedAt: updatedAdmin?.updatedAt || new Date(),
      },
    });
  } catch (error: any) {
    console.error("PUT /api/admin/profile error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to update administrator profile.",
      },
      { status: 500 }
    );
  }
}
