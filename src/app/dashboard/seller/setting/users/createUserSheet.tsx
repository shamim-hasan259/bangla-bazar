import { Button, ButtonProps } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import React from "react";
import UserForm from "./userForm";

function CreateUserSheet() {
  return (
    <div className="scroll">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="seller">Add New User</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Add New User</SheetTitle>
            <UserForm />
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default CreateUserSheet;
