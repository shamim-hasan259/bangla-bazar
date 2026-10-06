import { Button, ButtonProps } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import React from 'react'
import UserForm from "./userForm"


function CreateUserSheet() {
  return (
    <div className="scroll">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="default">Create New User</Button>
        </SheetTrigger>
        <SheetContent className="sm:max-w-[540px]">
          <SheetHeader>
            <SheetTitle>Create New User</SheetTitle>
            <SheetDescription>
              Fill out the form below to register a new user in the system.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4">
            <UserForm />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

export default CreateUserSheet


