export const dynamic = "force-dynamic";
import prisma from "@/index";
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../helpers/server-helpers";

// GET /api/category
// Queries:
// - all=true -> returns all categories flat with parent & subcategories
// - parentId=<id> -> returns subcategories of that parentId
// - default -> returns top-level categories (parentId: null) with their active nested subcategories
export const GET = async (req: Request) => {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all");
    const parentId = searchParams.get("parentId");

    if (parentId) {
      const validParentId = /^[0-9a-fA-F]{24}$/.test(parentId.trim()) ? parentId.trim() : null;
      if (!validParentId) {
        return NextResponse.json([], { status: 200 });
      }

      const subcategories = await prisma.category.findMany({
        where: {
          parentId: validParentId,
          status: "Active",
        },
        include: {
          _count: {
            select: { products: true },
          },
        },
        orderBy: {
          name: "asc",
        },
      });

      return NextResponse.json(subcategories, { status: 200 });
    }

    if (all === "true") {
      const res = await prisma.category.findMany({
        where: {
          status: "Active",
        },
        include: {
          parent: {
            select: { id: true, name: true, code: true },
          },
          subcategories: {
            where: { status: "Active" },
            select: { id: true, name: true, code: true, photo: true, status: true },
          },
          _count: {
            select: { products: true },
          },
        },
        orderBy: {
          name: "asc",
        },
      });

      return NextResponse.json(res, { status: 200 });
    }

    // Default: Top-level Categories with nested subcategories
    const res = await prisma.category.findMany({
      where: {
        status: "Active",
        parentId: null,
      },
      include: {
        subcategories: {
          where: { status: "Active" },
          select: { id: true, name: true, code: true, photo: true, status: true },
        },
        _count: {
          select: { products: true },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(res, { status: 200 });
  } catch (error) {
    console.error("Error getting category:", error);
    return NextResponse.json(
      { error: "Failed to get category" },
      { status: 500 }
    );
  }
};

// POST /api/category -> Create new Category or Subcategory
export const POST = async (req: Request) => {
  try {
    await connectToDatabase();
    const body = await req.json();
    let { name, code, photo, parentId, description, status } = body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (!code || code.trim() === "") {
      const slug = name.toString().toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-]+/g, "").replace(/\-\-+/g, "-").replace(/^-+/, "").replace(/-+$/, "");
      code = `${slug || "cat"}_${Math.random().toString(36).substr(2, 5)}`;
    }

    const validParentId = parentId && typeof parentId === "string" && /^[0-9a-fA-F]{24}$/.test(parentId.trim()) ? parentId.trim() : null;

    const created = await prisma.category.create({
      data: {
        name: name.trim(),
        code: code.trim(),
        photo: photo || "",
        parentId: validParentId,
        description: description || "",
        status: status || "Active",
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create category" },
      { status: 500 }
    );
  }
};

// PUT /api/category -> Update Category or Subcategory
export const PUT = async (req: Request) => {
  try {
    await connectToDatabase();
    const body = await req.json();
    let { id, name, code, photo, parentId, description, status } = body;

    if (!id || typeof id !== "string" || !/^[0-9a-fA-F]{24}$/.test(id.trim())) {
      return NextResponse.json({ error: "Valid Category ID is required" }, { status: 400 });
    }

    let validParentId = parentId && typeof parentId === "string" && /^[0-9a-fA-F]{24}$/.test(parentId.trim()) ? parentId.trim() : null;

    // Prevent self-referencing
    if (validParentId === id.trim()) {
      validParentId = null;
    }

    const updated = await prisma.category.update({
      where: { id: id.trim() },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(code ? { code: code.trim() } : {}),
        ...(photo !== undefined ? { photo } : {}),
        parentId: validParentId,
        ...(description !== undefined ? { description } : {}),
        ...(status ? { status } : {}),
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update category" },
      { status: 500 }
    );
  }
};

// DELETE /api/category -> Delete Category or Subcategory
export const DELETE = async (req: Request) => {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await req.json();
        id = body.id;
      } catch (e) {
        // No body
      }
    }

    if (!id || typeof id !== "string" || !/^[0-9a-fA-F]{24}$/.test(id.trim())) {
      return NextResponse.json({ error: "Valid Category ID is required" }, { status: 400 });
    }

    // Set children's parentId to null before deleting parent
    await prisma.category.updateMany({
      where: { parentId: id.trim() },
      data: { parentId: null },
    });

    const deleted = await prisma.category.delete({
      where: { id: id.trim() },
    });

    return NextResponse.json({ success: true, deleted }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete category" },
      { status: 500 }
    );
  }
};
