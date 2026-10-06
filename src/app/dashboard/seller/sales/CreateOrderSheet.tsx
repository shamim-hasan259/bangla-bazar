import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import React from 'react'
import OrderForm from "./orderForm"

function CreateOrderSheet() {
  return (
    <div className="scroll">
      <Sheet>
        <SheetTrigger asChild>
          <Button>Create New Order</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Create New Order</SheetTitle>
            <SheetDescription>
              <OrderForm />
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  )
}

export default CreateOrderSheet


