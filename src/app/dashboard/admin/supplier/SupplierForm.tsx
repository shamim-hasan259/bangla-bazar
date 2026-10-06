"use client";
import { Input } from "@/components/ui/input";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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
import axios from "axios";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { redirect, useRouter } from "next/navigation";
import { saveSupplier } from "./_action";
import { SupplierFormSchema } from "./SupplierFormSchema";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import CustomSelect from "@/components/ui/CustomSelect";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SupplierFormEditProps {
  entry: any;
  setOpen: React.Dispatch<React.SetStateAction<any>>;
}

function SupplierForm({ entry, setOpen }: SupplierFormEditProps) {
  const [id, setId] = useState<string>("");
  const form = useForm<z.infer<typeof SupplierFormSchema>>({
    resolver: zodResolver(SupplierFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      address: "",
      company: "",
      country: "",
      designation: "",
      description: "",
      status: "Active",
    },
  });

  useEffect(() => {
    //  (data);

    if (entry?.id) {
      form.setValue("name", entry?.name);
      form.setValue("description", entry?.description);
      form.setValue("phone", entry?.phone);
      form.setValue("email", entry?.email);
      form.setValue("address", entry?.address);
      form.setValue("company", entry?.company);
      form.setValue("country", entry?.country);
      form.setValue("designation", entry?.designation);
      form.setValue("status", entry?.status);
      setId(entry?.id);
    }
  }, []);

  async function onSubmit(data: z.infer<typeof SupplierFormSchema>) {
    try {
      //@ts-ignore
      const category = await saveSupplier(id, data);

      if (category) {
        form.reset();
        setOpen(false);
        toast.success(
          id ? "Supplier Update Success" : "Supplier Creation Success"
        );
      } else {
        toast.error(
          id ? "Supplier Update faield!" : "Supplier Creation faield!"
        );
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div>
      <ScrollArea className="w-full h-[600px] rounded-md space-x-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-5/6 space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Supplier Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Supplier Name" {...field} />
                  </FormControl>
                  {/* <FormDescription>
                                This is your public display name.
                            </FormDescription> */}
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
                    <Input placeholder="Phone" {...field} />
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
                    <Input placeholder="Email" {...field} />
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
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Address" {...field} />
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
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input placeholder="Country" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company</FormLabel>
                  <FormControl>
                    <Input placeholder="Company" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="designation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Designation</FormLabel>
                  <FormControl>
                    <Input placeholder="Designation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  // value={options.find((c) => c.value === value)}
                  >
                    <FormControl>
                      <SelectTrigger className="">
                        <SelectValue placeholder={field.value} />
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
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </ScrollArea>
      <Toaster />
    </div>
  );
}

export default SupplierForm;
