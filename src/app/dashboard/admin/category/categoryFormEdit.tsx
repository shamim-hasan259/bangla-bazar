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
import axios from "axios";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { redirect, useRouter } from "next/navigation";
import { CategoryFormSchema } from "./CategoryFormSchema";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import CustomSelect from "@/components/ui/CustomSelect";
import { categoryMCDw, saveCategory } from "./_action";
import SelectCategory from "@/components/ui/SelectCategory";
import SelectMc from "@/components/ui/SelectMc";

interface CategoryFormEditProps {
  entry: any;
  setOpen: React.Dispatch<React.SetStateAction<any>>;
}

function CategoryFormEdit({ entry, setOpen }: CategoryFormEditProps) {
  // const [parent, setParent] = useState<string>(entry?.parentId || "");
  const [mcId, setMcId] = useState<string>("");
  const [mcDW, setMcDW] = useState<any>([
    { value: "", label: "None (Main Category)" },
  ]);
  const [id, setId] = useState<string>("");
  const form = useForm<z.infer<typeof CategoryFormSchema>>({
    resolver: zodResolver(CategoryFormSchema),
    defaultValues: {
      id: "",
      name: "",
      description: "",
      code: "",
      photo: "",
      parentId: "",
      status: "Active",
    },
  });

  useEffect(() => {
    if (entry?.id) {
      form.setValue("name", entry.name);
      form.setValue("description", entry.description);
      form.setValue("code", entry.code);
      form.setValue("photo", entry.photo);
      form.setValue("parentId", entry.parentId || "");
      form.setValue("status", entry.status);
      form.setValue("id", entry.id);
      setId(entry?.id);
      setMcId(entry?.parentId);
      fetchMC(entry.id);
    } else {
      fetchMC();
    }
  }, [entry]);

  // Parent Category Handle Select Fucntion
  const handleMcId = (id: string) => {
    form.setValue("parentId", id);
    setMcId(id);
  };

  const fetchMC = async (excludeId?: string) => {
    try {
      const mcData = await categoryMCDw(excludeId);
      setMcDW(mcData);
    } catch (error) {
      console.error(error);
    }
  };

  // SUBMIT DATA - UPDATE CATEGORY
  async function onSubmit(data: z.infer<typeof CategoryFormSchema>) {
    "categoryEdit", entry;
    try {
      //@ts-ignore
      const newCategory = await saveCategory(data);
      if (newCategory) {
        form.reset();
        setOpen(false);
        toast.success("Category Update Success");
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
                <FormLabel>Category Name</FormLabel>
                <FormControl>
                  <Input placeholder="Category Name" {...field} />
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
            name="parentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parent Category</FormLabel>
                <FormControl>
                  <SelectMc
                    handleSelect={handleMcId}
                    selectedValue={entry?.parentId}
                    data={mcDW}
                  />
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
                    <SelectTrigger>
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

export default CategoryFormEdit;
