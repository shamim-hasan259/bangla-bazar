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
import CategoryForm from "./accountsHeadForm";
import CategoryFormEdit from "./accountsHeadEditForm";
import AccountsHeadEditForm from "./accountsHeadEditForm";

function AccountsHeadEditSheet({
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
            <SheetTitle>Edit Account Head</SheetTitle>
            <SheetDescription>
              Modify the details of the selected account head.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4">
            <AccountsHeadEditForm entry={entry} setOpen={setOpen} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default AccountsHeadEditSheet;
