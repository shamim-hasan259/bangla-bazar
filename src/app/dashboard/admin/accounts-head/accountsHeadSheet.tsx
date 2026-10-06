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
import BrandForm from "./accountsHeadForm";
import AccountsHead from "./accountsHeadForm";

function AccountsHeadSheet() {
  const [entry, setEntry] = useState<any>([]);
  const [open, setOpen] = useState<boolean>(false);
  return (
    <div className="scroll">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="default">Create New Accounts Head</Button>
        </SheetTrigger>
        <SheetContent className="sm:max-w-[540px]">
          <SheetHeader>
            <SheetTitle>Create New Accounts Head</SheetTitle>
            <SheetDescription>
              Enter the details below to create a new accounts head entry.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4">
            <AccountsHead entry={entry} setOpen={setOpen} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default AccountsHeadSheet;
