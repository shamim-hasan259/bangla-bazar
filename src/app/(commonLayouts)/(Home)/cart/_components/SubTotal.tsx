import { cn } from "@/lib/utils";
import { SubtotalProps } from "@/types/interface";
import React from "react";
import { Separator } from "@/components/ui/separator";

const SubTotal: React.FC<SubtotalProps> = ({
  className,
  totalQuantity,
  totalPrice,
}) => {
  const price = totalPrice || 0;
  const shipping = 0; // Free shipping for now or can be dynamic
  const tax = totalQuantity > 0 ? (price * 0.05) : 0; // 5% VAT example
  const finalTotal = price + shipping + tax;

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="text-xl font-bold border-b pb-4">Order Summary</h3>

      <div className="space-y-4">
        <div className="flex justify-between text-slate-500 text-sm font-medium">
          <span>Subtotal ({totalQuantity} items)</span>
          <span className="font-bold text-slate-900 dark:text-slate-100">${(price || 0).toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-slate-500 text-sm font-medium">
          <span>Shipping Fee</span>
          <span className="text-green-600 font-bold uppercase text-[10px] bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full border border-green-100 dark:border-green-800">Free</span>
        </div>

        <div className="flex justify-between text-slate-500 text-sm font-medium">
          <span>Estimated Tax (5%)</span>
          <span className="font-bold text-slate-900 dark:text-slate-100">${(tax || 0).toFixed(2)}</span>
        </div>
      </div>

      <Separator className="bg-slate-100 dark:bg-slate-800" />

      <div className="flex justify-between items-center py-2">
        <span className="text-lg font-black text-slate-800 dark:text-slate-100">Grand Total</span>
        <span className="text-3xl font-black text-primary">
          ${(finalTotal || 0).toFixed(2)}
        </span>
      </div>

      <p className="text-xs text-muted-foreground italic">
        * Taxes and shipping are calculated at checkout.
      </p>
    </div>
  );
};

export default SubTotal;
