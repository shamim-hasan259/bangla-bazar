"use client";

import React from "react";
import { Check } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/redux-store/store";
import { setDeliveryAddress } from "@/app/redux-store/Slice/SalesSlice";
import CheckoutForm from "./CheckoutForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type TAddress = {
  id: string;
  type: string;
  name: string;
  country: string;
  district: string;
  city: string;
  streetAddress: string;
  zipCode: string;
  phone: string;
  email: string;
  status: "active" | "inActive";
};

type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: TAddress[];
};

const DeliveryAddressSheet = ({ customer }: { customer: Customer }) => {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = React.useState(false);

  const deliveryAddress = useSelector(
    (state: RootState) => state.salesSlice.deliveryAddress
  );

  const dbAddress = Array.isArray(customer?.address)
    ? customer.address.find((a: any) => a.type === "shipping")
    : null;

  React.useEffect(() => {
    if (dbAddress) {
      dispatch(setDeliveryAddress(dbAddress));
      localStorage.setItem("bangla_mart_checkout_address", JSON.stringify(dbAddress));
    } else {
      const savedAddress = localStorage.getItem("bangla_mart_checkout_address");
      if (savedAddress) {
        try {
          const parsed = JSON.parse(savedAddress);
          dispatch(setDeliveryAddress({
            ...parsed,
            id: customer?.id || `active_checkout_${Date.now()}`
          }));
        } catch (e) {
          console.error("Failed to parse saved address", e);
        }
      }
    }
  }, [dbAddress, customer?.id, dispatch]);

  const hasAddress = !!(deliveryAddress?.name && deliveryAddress?.phone && deliveryAddress?.streetAddress);

  return (
    <div className="col-span-1 lg:col-span-6 space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 lg:p-8 shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <h3 className="font-bold text-2xl text-slate-800 dark:text-slate-100">Shipping address</h3>
          {hasAddress && (
            <button
              onClick={() => setIsOpen(true)}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold text-sm cursor-pointer transition-colors"
            >
              Change
            </button>
          )}
        </div>

        {hasAddress ? (
          <div className="text-slate-800 dark:text-slate-300 space-y-2 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-base text-slate-900 dark:text-slate-50">{deliveryAddress.name}</span>
              <span className="text-slate-500 dark:text-slate-400 font-medium">{deliveryAddress.phone}</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 font-normal">{deliveryAddress.streetAddress}</p>
            <p className="text-slate-500 dark:text-slate-400 font-normal">
              {[deliveryAddress.city, deliveryAddress.district, deliveryAddress.country || "Bangladesh", deliveryAddress.zipCode]
                .filter(Boolean)
                .join(", ")}
            </p>
          </div>
        ) : (
          <div className="py-8 flex flex-col items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/20 px-4 text-center">
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">No shipping address added yet.</p>
            <button
              onClick={() => setIsOpen(true)}
              className="px-6 h-11 rounded-full bg-[#1E60ED] hover:bg-[#164ec2] hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm"
            >
              Add Shipping Address
            </button>
          </div>
        )}

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                {hasAddress ? "Change Shipping Address" : "Add Shipping Address"}
              </DialogTitle>
              <DialogDescription>
                Provide details for your order delivery. All fields marked with * are required.
              </DialogDescription>
            </DialogHeader>
            <div className="py-2">
              <CheckoutForm
                dbCustomerId={customer?.id}
                initialAddress={deliveryAddress || dbAddress}
                onSaveSuccess={() => setIsOpen(false)}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="p-4 border border-blue-100 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900/50 rounded-xl flex items-start gap-3">
        <div className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full p-1 mt-0.5">
          <Check className="size-4" />
        </div>
        <div>
          <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Instant Order Confirmation</p>
          <p className="text-xs text-blue-600 dark:text-blue-400">Fill in your details and confirm your order instantly.</p>
        </div>
      </div>
    </div>
  );
};

export default DeliveryAddressSheet;
