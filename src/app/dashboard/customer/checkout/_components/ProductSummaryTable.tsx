import { CartItem } from "@/app/redux-store/Slice/CartSlice";
import React from "react";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { Package, Receipt, CreditCard } from "lucide-react";

const ProductSummaryTable = ({
  cartProducts,
  totalPrice,
  bundleDiscount = 0,
  bundleName = "",
  voucherDiscount = 0,
  voucherCode = "",
  grandTotal,
}: {
  cartProducts: CartItem[];
  totalPrice: number;
  bundleDiscount?: number;
  bundleName?: string;
  voucherDiscount?: number;
  voucherCode?: string;
  grandTotal: number;
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4 text-slate-700 dark:text-slate-300">
        <Package className="size-5" />
        <h3 className="font-bold underline">Order Items ({cartProducts?.length})</h3>
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {cartProducts.map((product) => (
          <div key={product.id} className="flex gap-4 group">
            <div className="relative size-20 flex-shrink-0 bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 transition-all group-hover:border-primary/30">
              <Image
                src={(() => {
                  if (Array.isArray(product.photo)) {
                    return product.photo[0] || "/placeholder-product.png";
                  }
                  if (typeof product.photo === "string" && product.photo.trim() !== "") {
                    return product.photo;
                  }
                  return "/placeholder-product.png";
                })()}
                alt={product.name}
                fill
                className="object-cover p-1"
              />
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-bl-lg">
                x{product.quantity}
              </div>
            </div>

            <div className="flex flex-col justify-between flex-grow py-0.5">
              <div>
                <h4 className="text-sm font-semibold line-clamp-2 text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors">
                  {product.name}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {product.price} ৳ / unit
                </p>
              </div>
              <p className="text-sm font-bold text-right text-slate-900 dark:text-slate-100">
                {product.price * product.quantity} ৳
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 space-y-3">
        <Separator className="bg-slate-100 dark:bg-slate-800" />

        <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2 text-sm">
            <Receipt className="size-4" />
            <span>Subtotal</span>
          </div>
          <span className="font-semibold text-slate-900 dark:text-slate-100">{totalPrice} ৳</span>
        </div>

        {bundleDiscount > 0 && (
          <div className="flex justify-between items-center text-blue-600 font-medium text-xs pb-1">
            <span>Bundle Discount ({bundleName})</span>
            <span>- {bundleDiscount} ৳</span>
          </div>
        )}

        {voucherDiscount > 0 && (
          <div className="flex justify-between items-center text-green-600 font-medium text-xs pb-1">
            <span>Voucher Discount ({voucherCode})</span>
            <span>- {voucherDiscount} ৳</span>
          </div>
        )}

        <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 pb-2">
          <div className="flex items-center gap-2 text-sm">
            <CreditCard className="size-4" />
            <span>Shipping</span>
          </div>
          <span className="text-xs font-medium text-green-600 bg-green-50 dark:bg-green-950/30 px-2 py-0.5 rounded-full">Free</span>
        </div>

        <Separator className="bg-slate-200 dark:bg-slate-700 h-0.5" />

        <div className="flex justify-between items-center pt-1">
          <span className="text-lg font-bold text-slate-900 dark:text-slate-100">Total</span>
          <div className="text-right">
            <span className="text-2xl font-black text-primary animate-pulse-slow">
              {grandTotal} ৳
            </span>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Including VAT</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSummaryTable;
