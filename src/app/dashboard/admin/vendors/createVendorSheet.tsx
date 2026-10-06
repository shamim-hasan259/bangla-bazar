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
import VendorForm from "./VendorForm";

function CreateVendorSheet() {
  const [entry, setEntry] = useState<any>([]);
  const [open, setOpen] = useState<boolean>(false);

  return (
    <div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="default">Create New Vendor</Button>
        </SheetTrigger>
        <SheetContent className="sm:max-w-[540px] w-full flex flex-col h-full max-h-screen p-0 overflow-hidden">
          <SheetHeader className="p-6 pb-2 shrink-0 border-b border-slate-100 dark:border-slate-800">
            <SheetTitle>Create New Vendor</SheetTitle>
            <SheetDescription>
              Onboard a new vendor by entering their information in the form below.
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

export default CreateVendorSheet;
