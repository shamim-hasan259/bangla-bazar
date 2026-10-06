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
import WareHouseForm from "./wareHouseForm";

function EditUnitSheet({
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
        <SheetContent className="w-[1000px]">
          <SheetHeader>
            <SheetTitle>Edit Warehouse</SheetTitle>
            <SheetDescription>
              <WareHouseForm entry={entry} setOpen={setOpen} />
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default EditUnitSheet;
