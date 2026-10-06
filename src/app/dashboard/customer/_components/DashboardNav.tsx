import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import CartSheet from "@/components/home/CartSheet";
import BackButton from "./BackButton";
import NotificationBell from "./NotificationBell";

async function DashboardNav() {
  const session = await getServerSession(authOptions);
  
  const userInitials = session?.user?.name
    ? session.user.name.charAt(0).toUpperCase()
    : "A";

  return (
    <header className="w-full h-12 border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 px-6 flex items-center justify-between sticky top-0 z-30 shrink-0 select-none">
      <div className="flex items-center gap-2">
        <BackButton />
        <span className="text-[13px] font-semibold text-slate-500 dark:text-slate-400">
          Home / Customer Dashboard
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Shopping Cart Button */}
        <CartSheet
          triggerClassName="w-8 h-8 border border-slate-200 dark:border-slate-800 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800/40 p-0 flex items-center justify-center text-slate-850 dark:text-slate-200 cursor-pointer transition-colors"
          iconClassName="w-4 h-4 text-slate-850 dark:text-slate-200"
        />

        {/* Notifications Bell */}
        <NotificationBell customerId={session?.user?.id || ""} />

        {/* User Initials Avatar */}
        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-850 dark:text-slate-200 font-extrabold text-xs select-none">
          {userInitials}
        </div>
      </div>
    </header>
  );
}

export default DashboardNav;