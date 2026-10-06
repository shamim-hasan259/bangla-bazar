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
import { updateCustomerProfile } from "../_action";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const AccountSettingForm = ({ customer }: { customer: any }) => {
  const router = useRouter();
  const accountSettingFormSchema = z.object({
    firstName: z.string().min(1, {
      message: "First name is required.",
    }),
    lastName: z.string().optional().or(z.literal("")),
    email: z.string().optional().or(z.literal("")),
    phone: z.string().min(1, {
      message: "Phone number is required.",
    }),
  });

  const [firstName, ...rest] = (customer?.name || "")?.split(" ") || ["", ""];
  const lastName = rest.join(" ");

  const form = useForm<z.infer<typeof accountSettingFormSchema>>({
    resolver: zodResolver(accountSettingFormSchema),
    defaultValues: {
      firstName: firstName || "",
      lastName: lastName || "",
      phone: customer?.phone || "",
      email: customer?.email || "",
    },
  });

  React.useEffect(() => {
    if (customer) {
      const [fName, ...r] = (customer?.name || "")?.split(" ") || ["", ""];
      const lName = r.join(" ");
      form.reset({
        firstName: fName || "",
        lastName: lName || "",
        phone: customer?.phone || "",
        email: customer?.email || "",
      });
    }
  }, [customer, form]);

  const [isLoading, setIsLoading] = React.useState(false);

  const handleSaveChange = async (data: z.infer<typeof accountSettingFormSchema>) => {
    try {
      setIsLoading(true);
      const identifier = customer?.id || customer?.customerId;
      const res = await updateCustomerProfile(identifier, data);
      if (res.success) {
        toast.success("Profile updated successfully");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update profile");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSaveChange)} className="">
        {/* Form Fields */}
        <div className="space-y-4">
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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
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
                <FormLabel>Phone Number</FormLabel>
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
      </form>
    </Form>
  );
};

export default AccountSettingForm;
