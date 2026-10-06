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
import UnitForm from "./wareHouseForm";

function CreateWhSheet() {
  const [entry, setEntry] = useState<any>([]);
  const [open, setOpen] = useState<boolean>(false);
  return (
    <div className="scroll">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="default">Create New Warehouse</Button>
        </SheetTrigger>
        <SheetContent className="sm:max-w-[540px]">
          <SheetHeader>
            <SheetTitle>Create New Warehouse</SheetTitle>
            <SheetDescription>
              Add a new storage location to your logistics network.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4">
            <UnitForm entry={entry} setOpen={setOpen} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default CreateWhSheet;
