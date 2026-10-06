"use client";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import React, { useState } from "react";
import CategoryForm from "./categoryForm";

function CreateCategorySheet() {
  const [entry, setEntry] = useState<any>([]);
  const [open, setOpen] = useState<boolean>(false);
  return (
    <div className="scroll">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="seller">Create New Category</Button>
        </SheetTrigger>
        <SheetContent className="sm:max-w-[540px]">
          <SheetHeader>
            <SheetTitle>Create New Category</SheetTitle>
            <SheetDescription>
              Create a new category to better organize your product catalog.
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
