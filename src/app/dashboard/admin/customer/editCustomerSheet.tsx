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
        <SheetContent className="sm:max-w-[540px]">
          <SheetHeader>
            <SheetTitle>Edit Customer</SheetTitle>
            <SheetDescription>
              Update the customer's information using the form below.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4">
            {open && <CustomerForm entry={entry} setOpen={setOpen} />}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default EditCustomerSheet;
