import { Button, ButtonProps } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import React from "react";
import CategoryForm from "./categoryForm";
import CategoryFormEdit from "./categoryFormEdit";

function EditCategorySheet({
  entry,
  open,
  setOpen,
}: {
  entry: any;
  open: boolean;
  setOpen: any;
}) {
  //  ("edit category", entry);
  return (
    <div className="scroll">
      <Sheet open={open} onOpenChange={setOpen}>
        {/* <SheetTrigger>
          <Button variant="default">Create New Brand</Button>
        </SheetTrigger> */}
        <SheetContent className="sm:max-w-[540px]">
          <SheetHeader>
            <SheetTitle>Edit Category</SheetTitle>
            <SheetDescription>
              Update the details for the selected category.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4">
            <CategoryFormEdit entry={entry} setOpen={setOpen} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default EditCategorySheet;
