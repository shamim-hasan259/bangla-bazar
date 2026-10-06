"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { IoCartOutline } from "react-icons/io5";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { removeFromCart, updateQuantity, clearCart } from "@/app/redux-store/Slice/CartSlice";
import { RootState } from "@/app/redux-store/store";
import { Separator } from "../ui/separator";
import { useLanguage } from "@/context/LanguageContext";

const CartSheet = ({
  triggerClassName,
  iconClassName,
  showLabel = false,
}: {
  triggerClassName?: string;
  iconClassName?: string;
  showLabel?: boolean;
}) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const { t } = useLanguage();
  const {
    items: cartProducts = [],
    totalAmount: totalPrice = 0,
    totalQuantity = 0,
  } = useSelector((state: RootState) => state.cart || {});

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && !session?.user) {
      toast.error("Please log in to view your cart!");
      router.push("/auth/customer/login?callbackUrl=/cart");
      return;
    }
    setOpen(newOpen);
  };

  const handleUpdateQuantity = (id: string, currentQty: number, delta: number) => {
    const newQty = currentQty + delta;
    if (newQty > 0) {
      dispatch(updateQuantity({ id, quantity: newQty }));
    } else {
      dispatch(removeFromCart(id));
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          onClick={(e) => {
            if (!session?.user) {
              e.preventDefault();
              e.stopPropagation();
              toast.error("Please log in to view your cart!");
              router.push("/auth/customer/login?callbackUrl=/cart");
              return;
            }
            setOpen(true);
          }}
          className={cn("h-auto py-1 px-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-transparent hover:text-blue-600 transition-colors relative group flex items-center gap-1.5 cursor-pointer shadow-none border-none", triggerClassName)}
        >
          <div className="relative flex items-center">
            <IoCartOutline size={23} className={cn("text-slate-700 dark:text-slate-300 group-hover:text-blue-600 transition-colors", iconClassName)} />
            {session?.user && cartProducts.length > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-blue-600 text-white text-[10px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center border border-white dark:border-slate-900 shadow-xs">
                {cartProducts.length}
              </span>
            )}
          </div>
          {showLabel && (
            <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600 transition-colors">
              {t("cart")}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md h-full flex flex-col p-0 border-l border-slate-200 dark:border-slate-800 shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-1">
            <SheetTitle className="text-xl font-black flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              {t("cart", "Your Basket")}
            </SheetTitle>
            <Badge variant="secondary" className="rounded-full font-bold">
              {cartProducts.length} {t("items", "Items")}
            </Badge>
          </div>
          <SheetDescription className="text-slate-500 text-xs">
            {cartProducts.length > 0
              ? t("cart_summary_msg", "You're just a few steps away from completing your order.")
              : t("cart_empty_msg", "Your cart is currently empty. Start shopping to add some items!")}
          </SheetDescription>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
          {cartProducts.length > 0 ? (
            <div className="space-y-6">
              {cartProducts.map((product: any) => {
                // Image handling logic
                const img = Array.isArray(product.photo) && product.photo.length > 0
                  ? product.photo[0]
                  : typeof product.photo === 'string' ? product.photo : "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=200&auto=format&fit=crop";

                return (
                  <div key={product.id} className="group relative flex gap-4 bg-slate-50/50 dark:bg-slate-800/20 p-3 rounded-2xl border border-transparent hover:border-slate-100 dark:hover:border-slate-800 transition-all">
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                      <Image
                        src={img}
                        fill
                        alt={product.name}
                        className="object-contain p-2 transition-transform group-hover:scale-110"
                      />
                    </div>

                    <div className="flex flex-1 flex-col justify-between py-0.5">
                      <div>
                        <div className="flex justify-between">
                          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 line-clamp-1 pr-6">
                            {t(product.name, product.name)}
                          </h4>
                          <button
                            onClick={() => dispatch(removeFromCart(product.id))}
                            className="absolute top-3 right-3 text-slate-300 hover:text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5 uppercase tracking-wider">
                          {t("price", "Price")}: ৳{product.price}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg h-8 px-1">
                          <button
                            onClick={() => handleUpdateQuantity(product.id, product.quantity, -1)}
                            className="p-1 hover:text-primary transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold">{product.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(product.id, product.quantity, 1)}
                            className="p-1 hover:text-primary transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-sm font-black text-primary">
                          ৳{((product.price || 0) * (product.quantity || 0)).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center opacity-40 grayscale py-20 text-center">
              <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full mb-4">
                <IoCartOutline size={64} />
              </div>
              <h3 className="font-black text-xl">{t("cart_empty", "Empty Basket")}</h3>
              <p className="text-sm max-w-[200px] mt-2 italic">{t("cart_empty_sub", "Add products from the catalog to see them here.")}</p>
            </div>
          )}
        </div>

        {/* Footer / Summary */}
        {cartProducts.length > 0 && (
          <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 space-y-4 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)]">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium text-slate-500">
                <span>{t("subtotal", "Subtotal")}</span>
                <span>৳{(totalPrice || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-medium text-slate-500">
                <span>{t("total_items", "Total Items")}</span>
                <span>{totalQuantity} {t("units", "Units")}</span>
              </div>
              <Separator className="bg-slate-200 dark:bg-slate-800" />
              <div className="flex justify-between items-center pt-2">
                <span className="text-base font-black text-slate-800 dark:text-slate-100">{t("total_price", "Total Price")}</span>
                <span className="text-xl font-black text-primary">৳{(totalPrice || 0).toFixed(2)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 pt-2">
              <Button 
                onClick={async () => {
                  const userRole = String((session?.user as any)?.type || (session?.user as any)?.role || "").toLowerCase();
                  if (userRole === "admin") {
                    toast.error("Admin accounts are not permitted to place product orders.");
                    return;
                  }

                  if (cartProducts.length > 0) {
                    try {
                      await Promise.allSettled(
                        cartProducts.map((item: any) => 
                          fetch("/api/analytics/track", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              eventType: "INITIATE_CHECKOUT",
                              productId: item.id,
                            }),
                          })
                        )
                      );
                    } catch (err) {
                      console.error("Analytics error", err);
                    }
                  }
                  window.location.href = "/checkout";
                }}
                className={cn("w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-xl transition-all")}
              >
                {t("checkout", "Proceed to Checkout")}
              </Button>
              <div className="flex gap-2">
                <Link href="/cart" className="flex-1">
                  <Button className={cn("w-full h-11 rounded-xl font-bold border-slate-200 dark:border-slate-800")} variant="outline">
                    {t("view_full_cart", "View Full Cart")}
                  </Button>
                </Link>
                <Button
                  onClick={() => dispatch(clearCart())}
                  variant="ghost"
                  className="h-11 px-4 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
            <p className="text-[10px] text-center text-slate-400 font-medium">
              {t("tax_shipping_note", "Tax and shipping will be calculated during checkout.")}
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;
