export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import prisma from "@/index";
import { connectToDatabase } from "../../../../helpers/server-helpers";

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get("storeId");
    const sellerId = searchParams.get("sellerId");
    const customerId = searchParams.get("customerId");
    const conversationId = searchParams.get("conversationId");

    // Fetch message history for a specific conversation
    if (conversationId) {
      if (conversationId === "temp-convo-id" || !conversationId.match(/^[0-9a-fA-F]{24}$/)) {
        return NextResponse.json({ success: true, data: [] }, { status: 200 });
      }

      const messages = await prisma.message.findMany({
        where: {
          conversationId: conversationId,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      // Mark messages as read by recipient
      const recipientType = searchParams.get("recipientType"); // e.g. "Store", "Seller", "Customer"
      if (recipientType) {
        if (recipientType === "Customer") {
          await prisma.message.updateMany({
            where: {
              conversationId: conversationId,
              senderType: { in: ["Store", "Seller", "Admin"] },
              isRead: false,
            },
            data: {
              isRead: true,
            },
          });
        } else {
          await prisma.message.updateMany({
            where: {
              conversationId: conversationId,
              senderType: "Customer",
              isRead: false,
            },
            data: {
              isRead: true,
            },
          });
        }
      }

      return NextResponse.json({ success: true, data: messages }, { status: 200 });
    }

    // Find all conversations matching parameters
    const orConditions: any[] = [];

    if (storeId) {
      const rawStoreIds = storeId.includes(",") ? storeId.split(",") : [storeId];
      const validStoreIds = rawStoreIds
        .map((s) => s.trim())
        .filter((id) => /^[0-9a-fA-F]{24}$/.test(id));
      if (validStoreIds.length > 0) {
        orConditions.push({ storeId: { in: validStoreIds } });
      }
    }

    if (sellerId && /^[0-9a-fA-F]{24}$/.test(sellerId)) {
      orConditions.push({ sellerId: sellerId });

      // Also find all store IDs of this seller to match conversations by storeId
      const sellerStores = await prisma.store.findMany({
        where: { sellerId: sellerId, deletedAt: null },
        select: { id: true },
      });
      const storeIdsFromSeller = sellerStores.map((s) => s.id);
      if (storeIdsFromSeller.length > 0) {
        orConditions.push({ storeId: { in: storeIdsFromSeller } });
      }
    }

    const whereClause: any = {};
    if (customerId && /^[0-9a-fA-F]{24}$/.test(customerId)) {
      whereClause.customerId = customerId;
    }

    if (orConditions.length > 0) {
      whereClause.OR = orConditions;
    }

    if (!whereClause.customerId && !whereClause.OR) {
      return NextResponse.json({ success: true, data: [] }, { status: 200 });
    }

    const conversations = await prisma.conversation.findMany({
      where: whereClause,
      include: {
        store: {
          select: {
            id: true,
            storeNameEn: true,
            storeLogo: true,
            slug: true,
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            photo: true,
            phone: true,
          },
        },
        messages: {
          take: 1,
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json({ success: true, data: conversations }, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/messages error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to retrieve messages" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { conversationId, storeId, customerId, senderType, senderId, text, productId } = await req.json();
    if (!text || !senderType || !senderId) {
      return NextResponse.json(
        { error: "Missing required chat parameters" },
        { status: 400 }
      );
    }

    // 1. Locate or create conversation
    let conversation = null;

    if (conversationId && /^[0-9a-fA-F]{24}$/.test(conversationId)) {
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
      });
    }

    if (!conversation && storeId && customerId) {
      conversation = await prisma.conversation.findFirst({
        where: {
          storeId,
          customerId,
        },
      });

      if (!conversation) {
        const storeData = await prisma.store.findUnique({
          where: { id: storeId },
          select: { sellerId: true },
        });

        conversation = await prisma.conversation.create({
          data: {
            type: "Store_Customer",
            storeId,
            sellerId: storeData?.sellerId || undefined,
            customerId,
          },
        });
      }
    }

    if (!conversation) {
      return NextResponse.json(
        { error: "Could not find or create conversation" },
        { status: 400 }
      );
    }

    // If conversation exists but sellerId is missing, backfill it
    if (!conversation.sellerId && conversation.storeId) {
      const storeData = await prisma.store.findUnique({
        where: { id: conversation.storeId },
        select: { sellerId: true },
      });
      if (storeData?.sellerId) {
        await prisma.conversation.update({
          where: { id: conversation.id },
          data: { sellerId: storeData.sellerId },
        }).catch(() => { });
      }
    }

    // 2. Create message
    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId,
        senderType,
        text,
        productId: productId || undefined,
        isRead: false,
      },
    });

    const activeStoreId = conversation.storeId || storeId;
    const activeCustomerId = conversation.customerId || customerId;

    // 3. Create notification for the recipient
    if (senderType === "Customer") {
      if (activeStoreId) {
        const store = await prisma.store.findUnique({
          where: { id: activeStoreId },
          select: { sellerId: true, storeNameEn: true },
        });
        const customer = await prisma.customer.findUnique({
          where: { id: activeCustomerId },
          select: { name: true },
        });
        const customerName = customer?.name || "Customer";

        if (store?.sellerId) {
          await prisma.notification.create({
            data: {
              userId: store.sellerId,
              userType: "Seller",
              title: "New Customer Message",
              message: `New message from ${customerName}: "${text.length > 50 ? text.slice(0, 50) + "..." : text}"`,
              link: "/dashboard/seller/customer-communication",
              type: "ChatMessage",
              category: "StoreSeller",
              isRead: false,
            },
          }).catch(() => { });
        }
      }
    } else {
      if (activeStoreId && activeCustomerId) {
        const store = await prisma.store.findUnique({
          where: { id: activeStoreId },
          select: { storeNameEn: true },
        });
        const storeName = store?.storeNameEn || "Store";

        await prisma.notification.create({
          data: {
            userId: activeCustomerId,
            userType: "Customer",
            title: "New Message",
            message: `New message from ${storeName}: "${text.length > 50 ? text.slice(0, 50) + "..." : text}"`,
            link: "/dashboard/customer/chat",
            type: "ChatMessage",
            category: "StoreSeller",
            isRead: false,
          },
        }).catch(() => { });
      }
    }

    // 4. Touch conversation updatedAt
    await prisma.conversation.update({
      where: {
        id: conversation.id,
      },
      data: {
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, data: message }, { status: 200 });
  } catch (error: any) {
    console.error("POST /api/messages error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to send message" },
      { status: 500 }
    );
  }
}
