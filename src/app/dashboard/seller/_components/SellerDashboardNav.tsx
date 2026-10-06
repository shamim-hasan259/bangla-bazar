import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import BackButton from "./BackButton";
import { Bell } from "lucide-react";
import Link from "next/link";
import prisma from "@/index";

async function SellerDashboardNav() {
  const session = await getServerSession(authOptions);
  
  const userInitials = session?.user?.name
    ? session.user.name.charAt(0).toUpperCase()
    : "S";

  let unreadCount = 0;
  if (session?.user?.id) {
    try {
      const sellerId = session.user.id;
      const isObjectId = typeof sellerId === "string" && /^[0-9a-fA-F]{24}$/.test(sellerId);
      const seller = await prisma.seller.findFirst({
        where: {
          OR: [
            ...(isObjectId ? [{ id: sellerId }] : []),
            { phone: (session.user as any).phone || undefined },
            { email: session.user.email || undefined },
          ],
        },
        select: { id: true, sellerId: true },
      });

      const validIds = [seller?.id, seller?.sellerId, sellerId].filter(Boolean) as string[];

      unreadCount = await prisma.notification.count({
        where: {
          userId: { in: validIds },
          userType: "Seller",
          isRead: false,
        },
      });
    } catch (e) {
      console.error("Failed to count seller unread notifications:", e);
    }
  }

  return (
    <header className="w-full h-16 border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 px-8 flex items-center justify-between sticky top-0 z-30 shrink-0 select-none">
      <BackButton />

      <div className="flex items-center gap-3">
        {/* Notifications Bell */}
        <Link href="/dashboard/seller/notifications">
          <button 
            className="w-9 h-9 border border-slate-200 dark:border-slate-800 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800/40 p-0 flex items-center justify-center text-slate-800 dark:text-slate-200 cursor-pointer transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
        </Link>

        {/* User Initials Avatar */}
        <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-800 dark:text-slate-200 font-extrabold text-sm select-none">
          {userInitials}
        </div>
      </div>
    </header>
  );
}

export default SellerDashboardNav;
