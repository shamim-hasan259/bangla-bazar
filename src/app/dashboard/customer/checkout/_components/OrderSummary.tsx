
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProductSummaryTable from "./ProductSummaryTable";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { CartProducts, CartProductTypes } from "@/types/interface";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/redux-store/store";

import { useRouter } from "next/navigation";
import { createCustomerOrder } from "@/app/dashboard/customer/checkout/_action";
import { clearCart } from "@/app/redux-store/Slice/CartSlice";
import { useToast } from "@/components/ui/use-toast";
import Loader from "@/components/ui/Loader";

import Link from "next/link";
import { BkashPaymentModal } from "./BkashPaymentModal";
import { ShoppingCart, ShieldCheck, ArrowRight, Receipt, Loader2, CreditCard, Truck, Smartphone } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useSession } from "next-auth/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface OrderSummaryProps {
  customerId?: string;
  initialVouchers?: any[];
  activeBundles?: any[];
}

const OrderSummary = ({
  customerId,
  initialVouchers = [],
  activeBundles = [],
}: OrderSummaryProps) => {
  const { data: session } = useSession();
  const userRole = String((session?.user as any)?.type || (session?.user as any)?.role || "").toLowerCase();
  const dispatch = useDispatch();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [isBkashOpen, setIsBkashOpen] = React.useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false);
  const [paymentMethod, setPaymentMethod] = React.useState("SSLCommerz");
  const [selectedVoucherId, setSelectedVoucherId] = React.useState<string>("");
  const [couponCodeInput, setCouponCodeInput] = React.useState("");
  const [appliedCoupon, setAppliedCoupon] = React.useState<{ code: string; discountAmount: number } | null>(null);

  const handleApplyCouponCode = async () => {
    if (!couponCodeInput.trim()) return;
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCodeInput.trim(), cartTotal: totalPrice }),
      });
      const data = await res.json();
      if (data.success) {
        setAppliedCoupon({
          code: data.coupon.code,
          discountAmount: data.coupon.discountAmount,
        });
        toast({
          title: "Coupon Applied!",
          description: `You saved ৳${data.coupon.discountAmount} with code ${data.coupon.code}`,
        });
      } else {
        toast({
          title: "Coupon Error",
          description: data.error,
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Coupon Error",
        description: "Failed to validate coupon code.",
        variant: "destructive",
      });
    }
  };

  const { items: cartProducts = [], totalAmount: totalPrice = 0, totalQuantity = 0 } = useSelector(
    (state: RootState) => state.cart || {}
  );

  const deliveryAddress = useSelector(
    (state: RootState) => state.salesSlice.deliveryAddress
  );

  // 1. Calculate active bundle discounts present in cart items
  let appliedBundleDiscount = 0;
  let appliedBundleName = "";
  activeBundles.forEach((bundle) => {
    const hasAllProducts = bundle.productIds.every((bProdId: string) =>
      cartProducts.some((cProd: any) => cProd.id.split("_")[0] === bProdId)
    );
    if (hasAllProducts) {
      appliedBundleDiscount += bundle.discountValue;
      appliedBundleName = bundle.name;
    }
  });

  // Filter collected vouchers eligible for current cart total
  const eligibleVouchers = initialVouchers.filter(
    (v) => v.voucher && totalPrice >= v.voucher.minOrderAmount
  );

  // 2. Calculate selected voucher discount value
  const selectedVoucher = initialVouchers.find((v) => v.voucher.id === selectedVoucherId)?.voucher;
  let voucherDiscount = 0;
  if (selectedVoucher) {
    if (selectedVoucher.discountType === "Percentage") {
      voucherDiscount = totalPrice * (selectedVoucher.discountValue / 100);
      if (selectedVoucher.maxDiscountAmount) {
        voucherDiscount = Math.min(voucherDiscount, selectedVoucher.maxDiscountAmount);
      }
    } else {
      voucherDiscount = selectedVoucher.discountValue;
    }
  }

  // Add general promo coupon discount if applied
  const totalCouponDiscount = voucherDiscount + (appliedCoupon?.discountAmount || 0);

  // 3. Subtract discounts from the final grand total
  const grandTotal = Math.max(0, totalPrice - appliedBundleDiscount - totalCouponDiscount);

  const handlePlaceOrderClick = () => {
    if (userRole === "admin") {
      toast({
        title: "Order Restricted",
        description: "Admin accounts cannot place product orders. Please sign in with a customer account.",
        variant: "destructive",
      });
      return;
    }

    if (cartProducts.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add products to your cart before checking out.",
        variant: "destructive",
      });
      return;
    }

    if (!deliveryAddress) {
      toast({
        title: "Address Required",
        description: "Please add a shipping address before confirming your order.",
        variant: "destructive",
      });
      return;
    }

    const requiredFields = ["name", "phone", "streetAddress", "city", "district", "zipCode"];
    const missingFields = requiredFields.filter(
      (field) => !deliveryAddress[field] || String(deliveryAddress[field]).trim() === ""
    );

    if (missingFields.length > 0) {
      toast({
        title: "Incomplete Address",
        description: `Please update your shipping address. The following fields are required: ${missingFields
          .map((f) => (f === "zipCode" ? "Zip Code" : f === "streetAddress" ? "Street Address" : f.charAt(0).toUpperCase() + f.slice(1)))
          .join(", ")}.`,
        variant: "destructive",
      });
      return;
    }


    // Check for Online Payment and Guest User (SSLCommerz and bKash are online)
    if ((paymentMethod === "SSLCommerz" || paymentMethod === "bKash") && !customerId) {
      setIsLoginModalOpen(true);
      return;
    }

    if (paymentMethod === "ManualBkash") {
      setIsBkashOpen(true);
      return;
    }

    // Handle SSLCommerz, bKash or COD directly
    handleConfirmOrder({ bkashNumber: "", transactionId: "" });
  }

  const handleConfirmOrder = async (bkashData: { bkashNumber: string; transactionId: string }) => {
    try {
      setLoading(true);
      const res = await createCustomerOrder({
        customerId,
        items: cartProducts,
        totalAmount: grandTotal,
        totalQuantity,
        deliveryAddress,
        paymentMethod: paymentMethod,
        voucherId: selectedVoucherId || undefined,
        paymentDetails: paymentMethod === "ManualBkash" ? {
          mfs: {
            name: "Bkash",
            amount: grandTotal,
            senderNo: bkashData.bkashNumber,
            trxId: bkashData.transactionId
          }
        } : undefined
      });

      if (res.success) {
        if (res.url) {
          // Redirect to Payment Gateway
          window.location.href = res.url;
          return;
        }

        toast({
          title: "Order Placed Successfully!",
          description: `Order #${res.invoiceId} has been created.`,
        });
        dispatch(clearCart());
        if (customerId) {
          router.push(`/dashboard/customer/order-history/${res.orderId}`);
        } else {
          router.push("/");
        }
        setIsBkashOpen(false);
      } else {
        toast({
          title: "Order Failed",
          description: res.error || "Failed to proceed with order. Please try again or select Cash on Delivery.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Order Error",
        description: error?.message || "Something went wrong while placing your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (cartProducts.length === 0) {
    return (
      <Card className="col-span-1 lg:col-span-3 border-2 border-dashed bg-slate-50/50 dark:bg-slate-900/50">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto bg-slate-100 dark:bg-slate-800 p-3 rounded-full w-fit mb-2">
            <ShoppingCart className="size-6 text-slate-400" />
          </div>
          <CardTitle className="text-xl">Your Cart is Empty</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <p className="text-muted-foreground mb-6 text-sm">Add some amazing products to your cart to start shopping.</p>
          <Link href="/">
            <Button variant="default" className="w-full rounded-full group">
              Start Shopping <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="col-span-1 lg:col-span-3">
      <Card className="sticky top-24 shadow-xl border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-primary/50 to-primary" />
        <CardHeader className="bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Receipt className="size-5 text-primary" />
            </div>
            <CardTitle className="text-xl">Order Summary</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Product summary table */}
          <ProductSummaryTable
            cartProducts={cartProducts}
            totalPrice={totalPrice}
            bundleDiscount={appliedBundleDiscount}
            bundleName={appliedBundleName}
            voucherDiscount={voucherDiscount}
            voucherCode={selectedVoucher?.code || ""}
            grandTotal={grandTotal}
          />

          {/* Manual Coupon Code Input & Store Voucher Wallet Selector */}
          <div className="space-y-3 mt-6">
            <div className="p-4 rounded-2xl border border-dashed border-blue-200 bg-blue-50/10 space-y-2">
              <label className="font-bold text-xs uppercase text-slate-500 tracking-wider">
                Have a Promo / Coupon Code?
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter Code (e.g. SAVE20)"
                  value={couponCodeInput}
                  onChange={(e) => setCouponCodeInput(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs border rounded-xl bg-white dark:bg-slate-950 uppercase font-mono border-slate-200"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleApplyCouponCode}
                  className="rounded-xl text-xs font-bold px-4"
                >
                  Apply
                </Button>
              </div>
              {appliedCoupon && (
                <p className="text-xs font-bold text-emerald-600">
                  Coupon '{appliedCoupon.code}' applied! Saved ৳{appliedCoupon.discountAmount}
                </p>
              )}
            </div>

            {eligibleVouchers.length > 0 && (
              <div className="p-4 rounded-2xl border border-dashed border-green-200 bg-green-50/10 space-y-2">
                <label className="font-bold text-xs uppercase text-slate-500 tracking-wider">
                  Apply Store Voucher
                </label>
                <Select value={selectedVoucherId} onValueChange={(val) => setSelectedVoucherId(val === "no-voucher" ? "" : val)}>
                  <SelectTrigger className="rounded-xl border-slate-200 bg-white dark:bg-slate-950">
                    <SelectValue placeholder="Select available discount voucher" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-150">
                    <SelectItem value="no-voucher">Do Not Apply Voucher</SelectItem>
                    {eligibleVouchers.map((v) => (
                      <SelectItem key={v.voucher.id} value={v.voucher.id}>
                        {v.voucher.code} - Save {v.voucher.discountType === "Percentage" ? `${v.voucher.discountValue}%` : `৳${v.voucher.discountValue}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <Separator className="my-6" />

          {/* Payment Method Selection */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Select Payment Method</h4>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-1 gap-4">

              <div className={`flex items-center space-x-2 border rounded-xl p-4 transition-all cursor-pointer ${paymentMethod === "SSLCommerz" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-slate-200 hover:border-slate-300 dark:border-slate-800"}`}>
                <RadioGroupItem value="SSLCommerz" id="sslcommerz" />
                <Label htmlFor="sslcommerz" className="flex items-center flex-1 cursor-pointer">
                  <div className="bg-blue-100 p-2 rounded-lg mr-3">
                    <CreditCard className="size-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800 dark:text-slate-100">Online Payment</p>
                    <p className="text-xs text-muted-foreground">Pay securely with Card, Mobile Banking, or Net Banking</p>
                  </div>
                </Label>
              </div>

              {/* bKash Tokenized Redirect */}
              <div className={`flex items-center space-x-2 border rounded-xl p-4 transition-all cursor-pointer ${paymentMethod === "bKash" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-slate-200 hover:border-slate-300 dark:border-slate-800"}`}>
                <RadioGroupItem value="bKash" id="bkash" />
                <Label htmlFor="bkash" className="flex items-center flex-1 cursor-pointer">
                  <div className="bg-pink-100 p-2 rounded-lg mr-3">
                    <Smartphone className="size-5 text-pink-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800 dark:text-slate-100">bKash Payment</p>
                    <p className="text-xs text-muted-foreground">Pay safely with your bKash account (Sandbox)</p>
                  </div>
                </Label>
              </div>

              <div className={`flex items-center space-x-2 border rounded-xl p-4 transition-all cursor-pointer ${paymentMethod === "COD" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-slate-200 hover:border-slate-300 dark:border-slate-800"}`}>
                <RadioGroupItem value="COD" id="cod" />
                <Label htmlFor="cod" className="flex items-center flex-1 cursor-pointer">
                  <div className="bg-green-100 p-2 rounded-lg mr-3">
                    <Truck className="size-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800 dark:text-slate-100">Cash on Delivery</p>
                    <p className="text-xs text-muted-foreground">Pay when you receive the product</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="mt-8 space-y-4">
            {userRole === "admin" && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-center text-xs font-semibold text-amber-800 dark:text-amber-200">
                ⚠️ Admin accounts are not allowed to place product orders.
              </div>
            )}

            <Button
              disabled={loading || userRole === "admin"}
              onClick={handlePlaceOrderClick}
              className="w-full h-14 text-lg font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:scale-[1.02] active:scale-[0.98] group"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="size-5 animate-spin" /> Processing...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Confirm Order <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
              <ShieldCheck className="size-3 text-green-500" />
              Secure Checkout Guaranteed
            </div>
          </div>
        </CardContent>
      </Card>

      <Loader isOpen={loading} onClose={() => setLoading(false)} title="Placing Order..." />
      <BkashPaymentModal
        isOpen={isBkashOpen}
        onClose={() => setIsBkashOpen(false)}
        onConfirm={handleConfirmOrder}
        onSwitchToGateway={() => {
          setPaymentMethod("bKash");
          setIsBkashOpen(false);
          // Delay slightly to allow state to update before calling click logic 
          // or just call handlePlaceOrderClick logic directly for "bKash"
          setTimeout(() => {
            handleConfirmOrder({ bkashNumber: "", transactionId: "" });
          }, 100);
        }}
        loading={loading}
        totalAmount={grandTotal}
      />

      <AlertDialog open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Login Required</AlertDialogTitle>
            <AlertDialogDescription>
              To make an online payment, you need to be logged in to your account.
              You can proceed with <strong>Cash on Delivery</strong> without logging in, or login now to pay online.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Link href={`/auth/customer/login?callbackUrl=/dashboard/customer/checkout`}>
              <AlertDialogAction>Login Now</AlertDialogAction>
            </Link>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OrderSummary;
