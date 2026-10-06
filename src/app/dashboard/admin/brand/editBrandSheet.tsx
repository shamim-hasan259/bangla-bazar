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
import BrandForm from "./brandForm";
import BrandFormEdit from "./brandFormEdit";

function EditBrandSheet({
  entry,
  open,
  setOpen,
}: {
  entry: any;
  open: boolean;
  setOpen: any;
}) {
  //  (entry);
  return (
    <div className="scroll">
      <Sheet open={open} onOpenChange={setOpen}>
        {/* <SheetTrigger>
          <Button variant="default">Create New Brand</Button>
        </SheetTrigger> */}
        <SheetContent className="sm:max-w-[540px]">
          <SheetHeader>
            <SheetTitle>Edit Brand</SheetTitle>
            <SheetDescription>
              Update the information for the selected brand.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4">
            <BrandFormEdit entry={entry} setOpen={setOpen} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default EditBrandSheet;
