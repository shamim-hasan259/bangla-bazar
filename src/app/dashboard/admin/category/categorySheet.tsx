"use client";
import { Button, ButtonProps } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import React, { useState } from "react";
import BrandForm from "./categoryForm";
import CategoryForm from "./categoryForm";

function CreateCategorySheet() {
  const [entry, setEntry] = useState<any>([]);
  const [open, setOpen] = useState<boolean>(false);
  return (
    <div className="scroll">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="default">Create New Category</Button>
        </SheetTrigger>
        <SheetContent className="sm:max-w-[540px]">
          <SheetHeader>
            <SheetTitle>Create New Category</SheetTitle>
            <SheetDescription>
              Organize your store by adding a new product category.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4">
            <CategoryForm entry={entry} setOpen={setOpen} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default CreateCategorySheet;
