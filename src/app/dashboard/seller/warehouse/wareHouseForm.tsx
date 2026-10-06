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
import { saveUnit } from "./_action";
import { WireHouseFormSchema } from "./WireHouseFormSchema";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import CustomSelect from "@/components/ui/CustomSelect";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface CategoryFormEditProps {
  entry: any;
  setOpen: React.Dispatch<React.SetStateAction<any>>;
}

function WareHouseForm({ entry, setOpen }: CategoryFormEditProps) {
  const [id, setId] = useState<string>("");
  const form = useForm<z.infer<typeof WireHouseFormSchema>>({
    resolver: zodResolver(WireHouseFormSchema),
    defaultValues: {
      name: "",
      company: "",
      code: "",
      address: "",
      type: "",
      email: "",
      phone: "",
      status: "Active",
    },
  });

  useEffect(() => {
    //  (data);
    if (entry?.id) {
      form.setValue("name", entry.name);
      form.setValue("company", entry.company);
      form.setValue("code", entry.code);
      form.setValue("address", entry.address);
      form.setValue("type", entry.type);
      form.setValue("email", entry.email);
      form.setValue("phone", entry.phone);
      form.setValue("status", entry.status);
      setId(entry?.id);
    }
  }, []);

  async function onSubmit(data: z.infer<typeof WireHouseFormSchema>) {
    try {
      //@ts-ignore
      const category = await saveUnit(id, data);

      if (category) {
        form.reset();
        setOpen(false);
        toast.success(
          id ? "Warehouse Update Success" : "Warehouse Creation Success"
        );
      } else {
        toast.error(
          id ? "Warehouse Update faield!" : "Warehouse Creation faield!"
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
                  <FormLabel>Warehouse Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Warehouse Name" {...field} />
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
              name="company"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Company</FormLabel>
                  <FormControl>
                    <Input placeholder="Company" {...field} />
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
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl>
                    <Input placeholder="code" {...field} />
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
                  <FormLabel>address</FormLabel>
                  <FormControl>
                    <Textarea placeholder="address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <FormControl>
                  <Textarea placeholder="type" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          /> */}

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
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="">
                        <SelectValue placeholder="Store" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Store">Store</SelectItem>
                      <SelectItem value="Warehouse">Warehouse</SelectItem>
                    </SelectContent>
                  </Select>

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
                  >
                    <FormControl>
                      <SelectTrigger className="">
                        <SelectValue placeholder="Active" />
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
            <Button
              variant="seller"
              type="submit"
              className={cn("text-gray-900 dark:text-gray-200")}
            >
              Submit
            </Button>
          </form>
        </Form>
      </ScrollArea>
      <Toaster />
    </div>
  );
}

export default WareHouseForm;
