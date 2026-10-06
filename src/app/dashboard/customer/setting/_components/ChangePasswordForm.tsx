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
import { Loader2 } from "lucide-react";
import { changeCustomerPassword } from "../_action"; 

const ChangePasswordForm = ({ customer }: { customer?: any }) => {
  const accountSettingFormSchema = z.object({
    currentPassword: z.string().min(4, {
      message: "Current password must be at least 4 characters.",
    }),
    newPassword: z.string().min(4, {
      message: "New password must be at least 4 characters.",
    }),
    confirmPassword: z.string().min(4, {
      message: "Confirm password must be at least 4 characters.",
    }),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

  const form = useForm<z.infer<typeof accountSettingFormSchema>>({
    resolver: zodResolver(accountSettingFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const [isLoading, setIsLoading] = React.useState(false);

  const handleSaveChange = async (data: z.infer<typeof accountSettingFormSchema>) => {
    try {
      setIsLoading(true);
      const identifier = customer?.id || customer?.customerId;
      const res = await changeCustomerPassword(identifier, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      if (res.success) {
        toast.success(res.message || "Password changed successfully!");
        form.reset();
      } else {
        toast.error(res.error || "Failed to change password");
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
        <div className="space-y-4 grid md:grid-cols-2 gap-x-4">
          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <Input placeholder="Password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* new password, confirm pass */}
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input placeholder="Password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm password</FormLabel>
                <FormControl>
                  <Input placeholder="Password" {...field} />
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
              Updating...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default ChangePasswordForm;
