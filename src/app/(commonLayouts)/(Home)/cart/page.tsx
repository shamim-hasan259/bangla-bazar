"use client";

import React, { useEffect } from "react";
import ShoppingCart from "./_components/ShoppingCart";
import SubTotal from "./_components/SubTotal";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSelector } from "react-redux";
import { ArrowLeft, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

const CartPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { items = [], totalAmount = 0, totalQuantity = 0 } = useSelector(
    (state: any) => state.cart || {}
  );

  useEffect(() => {
    if (status !== "loading" && !session?.user) {
      toast.error("Please log in to view your cart!");
      router.push("/auth/customer/login?callbackUrl=/cart");
    }
  }, [session, status, router]);

  if (status === "loading" || !session?.user) {
    return (
      <div className="min-h-[500px] flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded mb-2"></div>
          <div className="h-3 w-48 bg-slate-200 dark:bg-slate-800 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Your Shopping Cart</h1>
            <p className="mt-2 text-lg text-slate-500 dark:text-slate-400">
              You have <span className="font-bold text-primary">{totalQuantity} items</span> in your cart
            </p>
          </div>
          <Link href="/products" className="group flex items-center text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Continue Shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Cart Items Section */}
          <div className="lg:col-span-8">
            <ShoppingCart
              cartProducts={items}
              totalPrice={totalAmount}
              totalQuantity={totalQuantity}
            />
          </div>

          {/* Checkout Summary Card */}
          <div className="lg:col-span-4 lg:sticky lg:top-24">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
              <div className="p-8">
                <SubTotal totalPrice={totalAmount} totalQuantity={totalQuantity} />

                {String((session?.user as any)?.type || (session?.user as any)?.role || "").toLowerCase() === "admin" && (
                  <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl text-center text-xs font-semibold text-amber-800 dark:text-amber-200">
                    ⚠️ Admin accounts cannot place orders. Please use a customer account.
                  </div>
                )}

                <Button 
                  disabled={String((session?.user as any)?.type || (session?.user as any)?.role || "").toLowerCase() === "admin"}
                  onClick={async () => {
                    const userRole = String((session?.user as any)?.type || (session?.user as any)?.role || "").toLowerCase();
                    if (userRole === "admin") {
                      toast.error("Admin accounts cannot place product orders. Please sign in as a customer.");
                      return;
                    }

                    if (items.length > 0) {
                      try {
                        await Promise.allSettled(
                          items.map((item: any) => 
                            fetch("/api/analytics/track", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                eventType: "INITIATE_CHECKOUT",
                                productId: item.id.split("_")[0],
                              }),
                            })
                          )
                        );
                      } catch (err) {
                        console.error("Analytics error", err);
                      }
                    }
                    router.push("/checkout");
                  }}
                  className="w-full h-14 mt-6 rounded-full text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-[0.98]"
                >
                  <CreditCard className="mr-2 h-5 w-5" />
                  Proceed to Checkout
                </Button>

                <div className="mt-8 space-y-4">
                  <div className="flex items-center gap-3 text-xs text-slate-400 font-medium px-2">
                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
                    <span>WE ACCEPT</span>
                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
                  </div>
                  <div className="flex justify-center gap-4 opacity-40 grayscale">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Support Info */}
            <div className="mt-6 p-6 rounded-2xl bg-primary/5 border border-primary/10">
              <h4 className="text-sm font-bold text-primary mb-1">Need help?</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                If you have any questions or need assistance with your order,
                our support team is available 24/7.
              </p>
              <Button variant="link" className="p-0 h-auto text-xs font-bold mt-2">
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
