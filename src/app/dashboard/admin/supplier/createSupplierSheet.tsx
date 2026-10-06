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
import SupplierForm from "./SupplierForm";

function CreateSupplierSheet() {
  const [entry, setEntry] = useState<any>([]);
  const [open, setOpen] = useState<boolean>(false);
  return (
    <div className="scroll">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="default">Create New Supplier</Button>
        </SheetTrigger>
        <SheetContent className="sm:max-w-[540px]">
          <SheetHeader>
            <SheetTitle>Create New Supplier</SheetTitle>
            <SheetDescription>
              Onboard a new vendor by entering their information in the form below.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4">
            <SupplierForm entry={entry} setOpen={setOpen} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default CreateSupplierSheet;
