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
import CustomerForm from "./CustomerForm";

function EditCustomerSheet({
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
        <SheetContent className="w-[1000px]">
          <SheetHeader>
            <SheetTitle>Edit Customer</SheetTitle>
            <SheetDescription>
              <CustomerForm entry={entry} setOpen={setOpen} />
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default EditCustomerSheet;
