"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import React from "react";
import { toast } from "sonner";
import { updateCustomerBillingAddress } from "../_action";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const BillingAddressForm = ({ customer }: { customer: any }) => {
  const router = useRouter();
  const billingAddressFormSchema = z.object({
    firstName: z.string().min(1, {
      message: "First name is required.",
    }),
    lastName: z.string().optional().or(z.literal("")),
    country: z.string().optional().or(z.literal("")),
    streetAddress: z.string().min(1, {
      message: "Street address is required.",
    }),
    city: z.string().min(1, {
      message: "City is required.",
    }),
    state: z.string().optional().or(z.literal("")),
    zipCode: z.string().optional().or(z.literal("")),
    phone: z.string().min(1, {
      message: "Phone number is required.",
    }),
    email: z.string().optional().or(z.literal("")),
  });

  const getBillingAddress = (cust: any) => {
    return Array.isArray(cust?.address)
      ? cust.address.find((a: any) => a.type === "billing") || cust.address[0] || {}
      : cust?.address && typeof cust.address === "object"
      ? cust.address
      : {};
  };

  const initialBillingAddr = getBillingAddress(customer);
  const [firstName, ...rest] = (initialBillingAddr?.name || customer?.name || "")?.split(" ");
  const lastName = rest.join(" ");

  const form = useForm<z.infer<typeof billingAddressFormSchema>>({
    resolver: zodResolver(billingAddressFormSchema),
    defaultValues: {
      firstName: firstName || "",
      lastName: lastName || "",
      country: initialBillingAddr?.country || "Bangladesh",
      streetAddress: initialBillingAddr?.streetAddress || "",
      city: initialBillingAddr?.city || "",
      state: initialBillingAddr?.state || "",
      zipCode: initialBillingAddr?.zipCode || "",
      phone: initialBillingAddr?.phone || customer?.phone || "",
      email: initialBillingAddr?.email || customer?.email || "",
    },
  });

  React.useEffect(() => {
    if (customer) {
      const addr = getBillingAddress(customer);
      const [fName, ...r] = (addr?.name || customer?.name || "")?.split(" ");
      const lName = r.join(" ");

      form.reset({
        firstName: fName || "",
        lastName: lName || "",
        country: addr?.country || "Bangladesh",
        streetAddress: addr?.streetAddress || "",
        city: addr?.city || "",
        state: addr?.state || "",
        zipCode: addr?.zipCode || "",
        phone: addr?.phone || customer?.phone || "",
        email: addr?.email || customer?.email || "",
      });
    }
  }, [customer, form]);

  const [isLoading, setIsLoading] = React.useState(false);

  const handleSaveChange = async (data: z.infer<typeof billingAddressFormSchema>) => {
    try {
      setIsLoading(true);
      const identifier = customer?.id || customer?.customerId;
      const res = await updateCustomerBillingAddress(identifier, data);
      if (res.success) {
        toast.success("Billing address updated successfully");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update billing address");
      }
    } catch (error) {
      toast.error("An error occurred while saving address");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSaveChange)}
        className="grid grid-cols-10 gap-6"
      >
        {/* Form Fields */}
        <div className="col-span-10 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country / Region</FormLabel>
                  <FormControl>
                    <Input placeholder="Bangladesh (BD)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="streetAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Street address</FormLabel>
                <FormControl>
                  <Input placeholder="House number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* town, state, zip code */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Town / City</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <FormLabel>Zip Code</FormLabel>
                  <FormControl>
                    <Input placeholder="1200" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* email, phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" variant="customer" className="mt-4" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default BillingAddressForm;
