"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { saveVendor } from "./_action";
import { VendorFormSchema } from "./VendorFormSchema";
import { Loader2 } from "lucide-react";

interface VendorFormEditProps {
  entry: any;
  setOpen: React.Dispatch<React.SetStateAction<any>>;
}

function VendorForm({ entry, setOpen }: VendorFormEditProps) {
  const [id, setId] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  const form = useForm<z.infer<typeof VendorFormSchema>>({
    resolver: zodResolver(VendorFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      address: "",
      country: "Bangladesh",
      district: "",
      division: "",
      commissionRate: 10,
      status: "Active",
    },
  });

  useEffect(() => {
    if (entry?.id) {
      form.setValue("name", entry?.name || "");
      form.setValue("phone", entry?.phone || "");
      form.setValue("email", entry?.email || "");
      form.setValue("address", entry?.address || "");
      form.setValue("country", entry?.country || "Bangladesh");
      form.setValue("district", entry?.district || "");
      form.setValue("division", entry?.division || "");
      form.setValue("commissionRate", entry?.commissionRate ?? 10);
      form.setValue("status", entry?.status || "Active");
      setId(entry?.id);
    }
  }, [entry, form]);

  async function onSubmit(data: z.infer<typeof VendorFormSchema>) {
    try {
      setSubmitting(true);
      const res: any = await saveVendor(id, data);

      if (res && res.success) {
        form.reset();
        setOpen(false);
        toast.success(res.message || (id ? "Vendor Updated Successfully!" : "Vendor Created Successfully!"));
      } else {
        toast.error(res?.message || (id ? "Vendor Update Failed!" : "Vendor Creation Failed!"));
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "An unexpected error occurred while saving vendor.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-4"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-xs font-bold">
                  Vendor Name <span className="text-rose-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Enter vendor name" {...field} className="rounded-xl" />
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
                <FormLabel className="text-xs font-bold">
                  Phone Number <span className="text-rose-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 01700000000" {...field} className="rounded-xl" />
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
                <FormLabel className="text-xs font-bold">Email Address</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="vendor@example.com" {...field} className="rounded-xl" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold">Address</FormLabel>
                <FormControl>
                  <Textarea placeholder="Full store / office address" rows={3} {...field} className="rounded-xl resize-none" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold">Country</FormLabel>
                  <FormControl>
                    <Input placeholder="Country" {...field} className="rounded-xl" />
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
                  <FormLabel className="text-xs font-bold">District</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Dhaka" {...field} className="rounded-xl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="division"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold">Division</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Dhaka Division" {...field} className="rounded-xl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="commissionRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold">Commission Rate (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="10"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? undefined : parseFloat(e.target.value)
                        )
                      }
                      className="rounded-xl"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold">Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="pt-4 pb-4">
            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#2563eb] hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl shadow-md flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving Vendor...
                </>
              ) : (
                id ? "Update Vendor" : "Create Vendor"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default VendorForm;
