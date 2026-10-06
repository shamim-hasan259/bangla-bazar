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
import { useRouter } from "next/navigation";
import { createBrand } from "./_action";
import { BrandFormSchema } from "./BrandFormSchema";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

function BrandForm() {
  const router = useRouter();

  const form = useForm<z.infer<typeof BrandFormSchema>>({
    resolver: zodResolver(BrandFormSchema),
    defaultValues: {
      name: "",
      description: "",
      code: "",
      logo: "",
      status: "Active",
    },
  });

  async function onSubmit(data: z.infer<typeof BrandFormSchema>) {
    try {
      //@ts-ignore
      const newBrand = await createBrand(data);

      if (newBrand) {
        form.reset();
        toast.success("Brand Creation Success");
      } else {
        toast.error("Brand Creatation faield!");
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
                <FormLabel>Brand Name</FormLabel>
                <FormControl>
                  <Input placeholder="Brand Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* <FormField
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
          /> */}
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
          <Button type="submit" variant="seller">
            Submit
          </Button>
        </form>
      </Form>
      <Toaster />
    </div>
  );
}

export default BrandForm;
