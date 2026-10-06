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

function CreateBrandSheet() {
  return (
    <div className="scroll">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="seller">Create New Brand</Button>
        </SheetTrigger>
        <SheetContent className="sm:max-w-[540px]">
          <SheetHeader>
            <SheetTitle>Create New Brand</SheetTitle>
            <SheetDescription>
              Register a new brand for your product listings.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4">
            <BrandForm />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default CreateBrandSheet;
