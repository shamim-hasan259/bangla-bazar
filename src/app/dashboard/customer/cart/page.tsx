// import ShoppingCart from "@/app/(Home)/cart/_components/ShoppingCart";
// import SubTotal from "@/app/(Home)/cart/_components/SubTotal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";

const DashboardShoppingCart = () => {
  return (
    <div className="xl:flex gap-8">
      {/* <ShoppingCart /> */}
      <div className="lg:col-span-2 border rounded p-4">
        {/* <SubTotal totalPrice={400.0} totalPrice={2} /> */}
        <Link href="/dashboard/customer/checkout">
          <Button className={cn("w-full mt-4 bg-primary-customer")}>
            Proceed to checkout
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default DashboardShoppingCart;
