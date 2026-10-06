import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import React from "react";
import VendorForm from "./VendorForm";

function EditVendorSheet({
  entry,
  open,
  setOpen,
}: {
  entry: any;
  open: boolean;
  setOpen: any;
}) {
  return (
    <div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="sm:max-w-[540px] w-full flex flex-col h-full max-h-screen p-0 overflow-hidden">
          <SheetHeader className="p-6 pb-2 shrink-0 border-b border-slate-100 dark:border-slate-800">
            <SheetTitle>Edit Vendor</SheetTitle>
            <SheetDescription>
              Update the details for the selected seller.
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-6 pb-12">
            <VendorForm entry={entry} setOpen={setOpen} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default EditVendorSheet;
