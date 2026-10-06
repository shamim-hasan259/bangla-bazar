import PageTitle from "@/components/ui/PageTitle";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/index";
import WithdrawalForm from "./WithdrawalForm";

export default async function SellerWalletPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return <div>Unauthorized</div>;

  const seller = await prisma.seller.findUnique({
    where: { id: session.user.id },
    include: {
      withdrawals: { orderBy: { createdAt: "desc" } }
    }
  });

  if (!seller) return <div>Seller not found</div>;

  return (
    <main className="flex min-h-screen flex-col gap-6 w-full">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <PageTitle title="My Wallet & Payouts" />
        <div className="grid gap-4 md:grid-cols-3">
           <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
              <h3 className="text-sm font-medium">Available Balance</h3>
              <p className="text-3xl font-bold">৳ {seller.walletBalance}</p>
           </div>
           <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
              <h3 className="text-sm font-medium">Commission Rate</h3>
              <p className="text-3xl font-bold">{seller.commissionRate}%</p>
           </div>
           <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
              <h3 className="text-sm font-medium">Total Withdrawals</h3>
              <p className="text-3xl font-bold">
                 ৳ {seller.withdrawals.filter((w: any) => w.status === "Completed").reduce((acc: number, curr: any) => acc + curr.amount, 0)}
              </p>
           </div>
        </div>

        <div className="mt-8 grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <div className="col-span-1 lg:col-span-2">
            <h3 className="text-xl font-bold mb-4">Recent Withdrawals</h3>
            <div className="space-y-4">
              {seller.withdrawals.map((w: any) => (
                <div key={w.id} className="p-4 border rounded-lg flex justify-between items-center bg-card shadow-sm">
                  <div>
                    <p className="font-bold text-lg">৳ {w.amount}</p>
                    <p className="text-sm text-gray-500">{w.paymentMethod} - {w.accountDetails}</p>
                    <p className="text-xs text-gray-400 mt-1">{w.createdAt.toDateString()}</p>
                  </div>
                  <div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${w.status === "Pending" ? "bg-yellow-100 text-yellow-800" : w.status === "Completed" ? "bg-green-100 text-green-800" : w.status === "Processing" ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"}`}>
                      {w.status}
                    </span>
                  </div>
                </div>
              ))}
              {seller.withdrawals.length === 0 && (
                 <div className="p-8 text-center border border-dashed rounded-lg text-gray-500">
                    No withdrawals yet.
                 </div>
              )}
            </div>
          </div>
          <div className="col-span-1">
            <WithdrawalForm sellerId={seller.id} maxAmount={seller.walletBalance} />
          </div>
        </div>
      </div>
    </main>
  );
}
