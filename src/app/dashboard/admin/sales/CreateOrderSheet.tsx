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
        <SheetContent className="sm:max-w-[540px]">
          <SheetHeader>
            <SheetTitle>Create New Order</SheetTitle>
            <SheetDescription>
              Fill in the details below to initiate a new sales order.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4">
            <OrderForm />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

export default CreateOrderSheet


