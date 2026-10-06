import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Barcode,
  ChevronDown,
  MoreHorizontal,
  Undo2,
  X,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/redux-store/store";
import {
  setProducts,
  setReturnProducts,
  setSoldProduct,
} from "@/app/redux-store/Slice/SalesSlice";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Popover } from "@/components/ui/popover";

export type Product = {
  id: string;
  name: string;
  photo: string;
  status: "Active" | "Inactive";
  mrp: number;
  articleCode: string;
  stock: number;
};


export const returnColumn: ColumnDef<Product>[] = [
  {
    accessorKey: "articleCode",
    header: "Article Code",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "mrp",
    header: "Price",
  },
  {
    accessorKey: "qty",
    header: "Quantity",
    cell: ({ row }) => {
      const product = row.original;
      const dispatch = useDispatch();
      const salesData = useSelector((state: RootState) => state.sales);
      const [showPopover, setShowPopover] = React.useState(false);
      const [popoverMessage, setPopoverMessage] = React.useState("");

      const handleQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newQty = parseInt(e.target.value) || 0;
        const existingSoldProduct = salesData.soldProducts.find(
          (p) => p.id === product.id
        );

        if (existingSoldProduct) {
          if (newQty <= existingSoldProduct.qty) {
            const existingReturnProduct = salesData.returnProducts.find(
              (p) => p.id === product.id
            );

            const restReturnProducts = salesData.returnProducts.filter(
              (p) => p.id !== product.id
            );

            const restSoldProducts = salesData.soldProducts.filter(
              (p) => p.id !== product.id
            );

            if (existingReturnProduct) {
              // Update existing return product
              const updatedReturnProduct = {
                ...existingReturnProduct,
                qty: newQty,
                total: newQty * existingReturnProduct.tp, // Assuming tp is defined
              };
              dispatch(
                setReturnProducts([...restReturnProducts, updatedReturnProduct])
              );
            } else {
              // Create new return product from sold products
              const newReturnProduct = {
                ...existingSoldProduct,
                qty: newQty,
                total: newQty * existingSoldProduct.tp, // Assuming tp is defined
              };
              dispatch(
                setReturnProducts([...restReturnProducts, newReturnProduct])
              );
              dispatch(setSoldProduct(restSoldProducts));
            }

            // Update sold product with reduced quantity
            const updatedSoldProduct = {
              ...existingSoldProduct,
              qty: existingSoldProduct.qty - newQty,
              total:
                (existingSoldProduct.qty - newQty) * existingSoldProduct.tp,
            };
            dispatch(setSoldProduct([...restSoldProducts, updatedSoldProduct]));
          } else {
            // Show popover or notification
            setShowPopover(true);
            setPopoverMessage(
              "Return quantity cannot be greater than sold quantity."
            );
            setTimeout(() => {
              setShowPopover(false);
            }, 3000); // Adjust timeout as per your requirement
          }
        }
      };

      return (
        <div className="relative">
          <input
            type="number"
            value={product?.qty}
            onChange={handleQtyChange}
            className="w-full border rounded p-1"
          />
          {showPopover && <Popover message={popoverMessage} position="top" />}
        </div>
      );
    },
  },
  {
    accessorKey: "vat",
    header: "Vat",
  },
  {
    accessorKey: "total",
    header: "Total",
  },
  {
    accessorKey: "",
    header: "Action",
    id: "actions",
    cell: ({ row }) => {
      const product = row.original;
      const dispatch = useDispatch();
      const salesData = useSelector((state: RootState) => state.sales);

      const handleReturnToSold = () => {
        const soldProducts = salesData.soldProducts || [];
        const returnProducts = salesData.returnProducts || [];

        const selected = returnProducts.find((item) => item.id === product.id);
        if (selected) {
          const restReturnProducts = returnProducts.filter(
            (s) => s.id !== product.id
          );
          dispatch(setSoldProduct([...soldProducts, selected]));
          dispatch(setReturnProducts(restReturnProducts));
        }
      };

      const handleCustomReturn = () => {
        const soldProducts = salesData.soldProducts || [];
        const returnProducts = salesData.returnProducts || [];

        const selected = returnProducts.find((item) => item.id === product.id);
        if (selected && selected.qty > 0) {
          const restReturnQty = selected.qty - 1; // Decrease the return quantity by 1
          const newSoldQty =
            (soldProducts.find((p) => p.id === product.id)?.qty || 0) + 1; // Increase sold quantity by 1

          const updatedReturnProducts =
            restReturnQty > 0
              ? [
                  ...returnProducts.filter((s) => s.id !== product.id),
                  {
                    ...selected,
                    qty: restReturnQty,
                    total: restReturnQty * selected.mrp, // Adjust total if necessary
                  },
                ]
              : returnProducts.filter((s) => s.id !== product.id);

          const updatedSoldProducts = [
            ...soldProducts.filter((p) => p.id !== product.id),
            {
              ...selected,
              qty: newSoldQty,
              total: newSoldQty * selected.mrp, // Adjust total if necessary
            },
          ];

          dispatch(setReturnProducts(updatedReturnProducts));
          dispatch(setSoldProduct(updatedSoldProducts));
        }
      };

      return (
        <div className="flex">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" onClick={handleCustomReturn}>
                  <ArrowUp size={16} className="cursor-pointer" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Custom Return</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={handleReturnToSold}>
                  <X size={16} className="cursor-pointer" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Full Return</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    },
  },
];
