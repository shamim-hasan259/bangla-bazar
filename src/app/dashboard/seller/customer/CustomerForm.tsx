"use client";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
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
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { CustomerFormSchema } from "./CustomerFormSchema";
import { CustomerDw, saveCustomer } from "./_action";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDispatch } from "react-redux";
import { setCustomerId } from "@/app/redux-store/Slice/SalesSlice";

const CustomerForm = ({ entry, setOpen }: { entry: any; setOpen: any }) => {
  const [id, setId] = useState<string>("");

  // Initialize the form with default values and validation
  const form = useForm<z.infer<typeof CustomerFormSchema>>({
    resolver: zodResolver(CustomerFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      photo: "",
      username: "",
      password: "",
      type: "Wholesale",
      contactPersonPhone: "",
      company: "",
      designation: "",
      bin: "",
      tin: "",
      dueType: "monthly",
      treadLicense: "",
      creditOption: "",
      cLimitAmount: "",
      cLimitDay: "",
      status: "Active",
    },
  });

  const dispatch = useDispatch();

  useEffect(() => {
    //  (data);
    if (entry?.id) {
      form.setValue("name", entry.name);
      form.setValue("phone", entry.phone);
      form.setValue("email", entry.email);
      form.setValue("photo", entry.photo);
      form.setValue("username", entry.username);
      form.setValue("type", entry.type);
      form.setValue("contactPersonPhone", entry.contactPersonPhone);
      form.setValue("company", entry.company);
      form.setValue("designation", entry.designation);
      form.setValue("dueType", entry.dueType);
      form.setValue("bin", entry.bin);
      form.setValue("tin", entry.tin);
      form.setValue("treadLicense", entry.treadLicense);
      form.setValue("creditOption", entry.creditOption);
      form.setValue("cLimitAmount", entry.cLimitAmount);
      form.setValue("cLimitDay", entry.cLimitDay);
      form.setValue("status", entry.status);
      setId(entry?.id);
    }
  }, []);

  // Handle form submission
  async function onSubmit(data: z.infer<typeof CustomerFormSchema>) {
    try {
      //@ts-ignore

      const customer = await saveCustomer(id, data);

      if (customer) {
        "customer", customer;
        dispatch(setCustomerId(customer?.id));

        form.reset();
        setOpen(false);
        toast.success(
          id ? "Customer Update Success" : "Customer Creation Success"
        );
      } else {
        toast.error(
          id ? "Customer Update faield!" : "Customer Creation faield!"
        );
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="w-full">
      <ScrollArea className="w-full h-[600px] rounded-md space-x-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-5/6 space-y-2"
          >
            {/* Form fields for registration */}
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>BIN No.</FormLabel>
                  <FormControl>
                    <Input placeholder="BIN" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone */}
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

            {/* Email */}
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

            {/* Address */}
            {/* <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="@username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}

            {/* Division */}
            {/* <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>

                  <FormControl>
                    <Input {...field} placeholder="password" />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            /> */}

            {/* Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value)}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="">
                        <SelectValue placeholder="Wholesale" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Wholesale">Wholesale</SelectItem>
                      <SelectItem value="Retail">Retail</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dueType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Type</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value)}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="">
                        <SelectValue placeholder="Monthly" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="billToBill">Bill To Bill</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Company */}
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
            {/* Conatct Person  Phone*/}
            <FormField
              control={form.control}
              name="contactPersonPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conatct Person Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="Phone" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Designation */}
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

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value)}
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
            <br />
            <Button className="w-full " type="submit">
              {id ? "Update" : "Create"} Customer
            </Button>
          </form>
        </Form>
      </ScrollArea>
      <Toaster />
    </div>
  );
};

export default CustomerForm;
