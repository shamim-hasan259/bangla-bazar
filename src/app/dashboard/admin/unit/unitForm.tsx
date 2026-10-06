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
import { UnitFormSchema } from "./UnitFormSchema";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import CustomSelect from "@/components/ui/CustomSelect";

interface CategoryFormEditProps {
  entry: any;
  setOpen: React.Dispatch<React.SetStateAction<any>>;
}

function UnitForm({ entry, setOpen }: CategoryFormEditProps) {
  const [id, setId] = useState<string>("");
  const form = useForm<z.infer<typeof UnitFormSchema>>({
    resolver: zodResolver(UnitFormSchema),
    defaultValues: {
      name: "",
      description: "",
      code: "",
      symbol: "",
      status: "Active",
    },
  });

  useEffect(() => {
    //  (data);
    if (entry?.id) {
      form.setValue("name", entry.name);
      form.setValue("description", entry.description);
      form.setValue("code", entry.code);
      form.setValue("symbol", entry.symbol);
      form.setValue("status", entry.status);
      setId(entry?.id);
    }
  }, []);

  async function onSubmit(data: z.infer<typeof UnitFormSchema>) {
    try {
      //@ts-ignore
      const category = await saveUnit(id, data);

      if (category) {
        form.reset();
        setOpen(false);
        toast.success(id ? "Unit Update Success" : "Unit Creation Success");
      } else {
        toast.error(id ? "Unit Update faield!" : "Unit Creation faield!");
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div>
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
                <FormLabel>Unit Name</FormLabel>
                <FormControl>
                  <Input placeholder="Unit Name" {...field} />
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
            name="symbol"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Symbol</FormLabel>
                <FormControl>
                  <Input placeholder="Symbol" {...field} />
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
          <Button type="submit">Submit</Button>
        </form>
      </Form>
      <Toaster />
    </div>
  );
}

export default UnitForm;
