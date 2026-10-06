"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { addressFormSchema } from "@/lib/checkoutFormSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useDispatch } from "react-redux";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { setDeliveryAddress } from "@/app/redux-store/Slice/SalesSlice";
import { saveCustomerShippingAddress } from "../_action";

interface CheckoutFormProps {
  dbCustomerId?: string;
  initialAddress?: any;
  onSaveSuccess?: () => void;
}

const CheckoutForm = ({ dbCustomerId, initialAddress, onSaveSuccess }: CheckoutFormProps) => {
  const { data: session } = useSession();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [saving, setSaving] = React.useState(false);

  const form = useForm<z.infer<typeof addressFormSchema>>({
    resolver: zodResolver(addressFormSchema),
    mode: "all", // Real-time validation
    defaultValues: {
      type: initialAddress?.type || "home",
      name: initialAddress?.name || session?.user?.name || "",
      phone: initialAddress?.phone || (session?.user as any)?.phone || "",
      email: initialAddress?.email || session?.user?.email || "",
      country: initialAddress?.country || "Bangladesh",
      district: initialAddress?.district || "",
      city: initialAddress?.city || "",
      streetAddress: initialAddress?.streetAddress || "",
      zipCode: initialAddress?.zipCode || "",
    },
  });

  // Reset form when initialAddress or session loads
  React.useEffect(() => {
    if (initialAddress) {
      form.reset({
        type: initialAddress.type || "home",
        name: initialAddress.name || "",
        phone: initialAddress.phone || "",
        email: initialAddress.email || "",
        country: initialAddress.country || "Bangladesh",
        district: initialAddress.district || "",
        city: initialAddress.city || "",
        streetAddress: initialAddress.streetAddress || "",
        zipCode: initialAddress.zipCode || "",
      });
    } else if (session?.user) {
      form.reset({
        type: "home",
        name: session.user.name || "",
        phone: (session.user as any).phone || "",
        email: session.user.email || "",
        country: "Bangladesh",
        district: "",
        city: "",
        streetAddress: "",
        zipCode: "",
      });
    }
  }, [initialAddress, session, form]);

  const onSubmit = async (values: z.infer<typeof addressFormSchema>) => {
    try {
      setSaving(true);
      const addressData = {
        ...values,
        id: initialAddress?.id || dbCustomerId || `active_checkout_${Date.now()}`
      };

      if (dbCustomerId) {
        const res = await saveCustomerShippingAddress(dbCustomerId, addressData);
        if (res.success) {
          dispatch(setDeliveryAddress(res.address));
          localStorage.setItem("bangla_mart_checkout_address", JSON.stringify(res.address));
          toast({
            title: "Success",
            description: "Shipping address updated successfully."
          });
          if (onSaveSuccess) {
            onSaveSuccess();
          }
        } else {
          toast({
            title: "Error",
            description: res.error || "Failed to save address",
            variant: "destructive"
          });
        }
      } else {
        // Guest user, save to Redux and localStorage only
        dispatch(setDeliveryAddress(addressData));
        localStorage.setItem("bangla_mart_checkout_address", JSON.stringify(addressData));
        toast({
          title: "Success",
          description: "Shipping address set."
        });
        if (onSaveSuccess) {
          onSaveSuccess();
        }
      }
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message || "Something went wrong",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-2 space-y-4">
        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-600 dark:text-slate-400">Address Type</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value) => field.onChange(value)}
                      value={field.value}
                    >
                      <SelectTrigger className="h-12 border-slate-200 dark:border-slate-800">
                        <SelectValue placeholder="Home, Office, etc" />
                      </SelectTrigger>
                      <SelectContent>
                        {["home", "office", "other"].map((type) => (
                          <SelectItem
                            key={type}
                            value={type}
                            className="capitalize"
                          >
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-600 dark:text-slate-400">Full Name *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter your full name" className="h-12 border-slate-200 dark:border-slate-800 focus-visible:ring-primary" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-600 dark:text-slate-400">Phone Number *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="01XXXXXXXXX" className="h-12 border-slate-200 dark:border-slate-800 focus-visible:ring-primary" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-600 dark:text-slate-400">Email Address (Optional)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="name@example.com" className="h-12 border-slate-200 dark:border-slate-800 focus-visible:ring-primary" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="district"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-600 dark:text-slate-400">District *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Dhaka, Chittagong, etc" className="h-12 border-slate-200 dark:border-slate-800 focus-visible:ring-primary" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-600 dark:text-slate-400">City / Town *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Your city" className="h-12 border-slate-200 dark:border-slate-800 focus-visible:ring-primary" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="zipCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-600 dark:text-slate-400">Zip / Postal Code *</FormLabel>
                <FormControl>
                  <Input placeholder="1234" {...field} className="h-12 border-slate-200 dark:border-slate-800 focus-visible:ring-primary" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="streetAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-600 dark:text-slate-400">Street Address *</FormLabel>
                  <FormControl>
                    <Input placeholder="House number and street name" {...field} className="h-12 border-slate-200 dark:border-slate-800 focus-visible:ring-primary" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="hidden">
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 pt-2">
          <Button type="submit" className="w-full h-12 text-sm font-bold rounded-xl" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Address
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CheckoutForm;
