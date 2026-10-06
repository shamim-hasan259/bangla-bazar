"use client";
import PageTitle from "@/components/ui/PageTitle";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, X } from "lucide-react";
import CsvUpload from "@/components/CsvUpload";
import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { CategoryDataTable } from "./data-table";
import { categoryMCDw, importCategory, saveCategory } from "./../_action";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CustomeSelectImport from "@/components/ui/customeSelectImport";

export default function CustomerImportPage() {
  type Category = {
    name: string;
    code: string;
    parent: string;
    parentId: string | null;
    description: string;
    status: string;
  };

  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: "",
      header: "#",
      cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "code",
      header: "Code",
    },
    {
      accessorKey: "description",
      header: "Description",
    },
    {
      accessorKey: "status",
      header: "Status",
    },
  ];

  const columnsTwo: ColumnDef<Category>[] = [
    {
      accessorKey: "",
      header: "#",
      cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "code",
      header: "Code",
    },
    {
      accessorKey: "parentId",
      header: "Parent Id",
    },
    {
      accessorKey: "description",
      header: "Description",
    },
    {
      accessorKey: "status",
      header: "Status",
    },
  ];

  const [CSV, setCSV] = useState<Category[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [isParent, setIsParent] = useState(true);

  useEffect(() => {
    if (isParent) {
      setCategories(CSV);
    } else {
      setSubCategories(CSV);
    }
  }, [CSV]);
  "printing", subCategories, isParent;

  //  ("csv", isParent);

  const handelImportSubCategory = async () => {
    "import", subCategories, categories, isParent;

    if (isParent) {
      const category = await importCategory(categories, isParent);
    } else {
      const subCategory = await importCategory(subCategories, isParent);
      subCategory;
    }
  };

  return (
    <main className="flex min-h-screen flex-col gap-6 w-full">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex">
          <Link href="/dashboard/category">
            <Button variant="ghost">
              <ArrowLeft />
            </Button>
          </Link>
          <PageTitle title="Import Category" />
        </div>
        <div className="flex items-center space-x-2">
          <CsvUpload setCSV={setCSV} handelImport={handelImportSubCategory} />
          <Link href={"/dashboard/category"}>
            <Button>
              <X size="16" className="mr-2" /> Cancel
            </Button>
          </Link>
        </div>
      </div>
      <Tabs defaultValue="category" className="w-full">
        <TabsList className="grid w-1/2 grid-cols-2 ml-8">
          <TabsTrigger value="category" onClick={() => setIsParent(true)}>
            Category
          </TabsTrigger>
          <TabsTrigger value="sub_category" onClick={() => setIsParent(false)}>
            Sub Category
          </TabsTrigger>
        </TabsList>
        <TabsContent value="category">
          <div className="flex-col flex w-full">
            <div className="flex-1 space-y-4 p-8 pt-6">
              <div>
                <CategoryDataTable columns={columns} data={categories} />
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="sub_category">
          <div className="flex-col flex w-full">
            <div className="flex-1 space-y-4 p-8 pt-6">
              <div>
                <CategoryDataTable columns={columnsTwo} data={subCategories} />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Toaster />
    </main>
  );
}
