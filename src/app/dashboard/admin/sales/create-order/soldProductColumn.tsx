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
  setGrossTotal,
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

export type Product = {
  id: string;
  name: string;
  photo: string;
  status: "Active" | "Inactive";
  mrp: number;
  articleCode: string;
  stock: number;
};


export const orderColumn: ColumnDef<Product>[] = [
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
    cell: ({ row, table }) => {
      const product = row.original;
      const dispatch = useDispatch();
      const salesData = useSelector((state: RootState) => state.sales);

      const handleQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newQty = parseInt(e.target.value) || 0;
        if (salesData.returnActive) {
          const existingReturnProduct = salesData.returnProducts.find(
            (p) => p.id === product.id
          );
          const existingSoldProduct = salesData.soldProducts.find(
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
          } else if (existingSoldProduct) {
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
        } else {
          const existingProduct = salesData.products.find(
            (p) => p.id === product.id
          );

          const restProducts = salesData.products.filter(
            (p) => p.id !== product.id
          );

          if (existingProduct) {
            const updatedProduct = {
              ...existingProduct,
              qty: newQty,
              total: newQty * existingProduct.tp, // Assuming tp is defined
            };
            dispatch(setProducts([...restProducts, updatedProduct]));
          }
        }
      };

      return (
        <input
          type="number"
          value={product?.qty}
          onChange={handleQtyChange}
          className="w-full border rounded p-1"
        />
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

      const handleFullReturn = () => {
        const soldProducts = salesData.soldProducts || [];
        const returnProducts = salesData.returnProducts || [];

        const selected = soldProducts.find((item) => item.id === product.id);
        if (selected) {
          const restSoldProducts = soldProducts.filter(
            (s) => s.id !== product.id
          );
          dispatch(setReturnProducts([...returnProducts, selected]));
          dispatch(setSoldProduct(restSoldProducts));
        }
      };

      const handleCustomReturn = () => {
        const soldProducts = salesData.soldProducts || [];
        const returnProducts = salesData.returnProducts || [];

        const selected = soldProducts.find((item) => item.id === product.id);
        if (selected && selected.qty > 0) {
          const restSoldQty = selected.qty - 1; // Decrease the sold quantity by 1
          const newReturnQty =
            (returnProducts.find((p) => p.id === product.id)?.qty || 0) + 1; // Increase return quantity by 1

          const updatedSoldProducts =
            restSoldQty > 0
              ? [
                  ...soldProducts.filter((s) => s.id !== product.id),
                  {
                    ...selected,
                    qty: restSoldQty,
                    total: restSoldQty * selected.mrp,
                  },
                ]
              : soldProducts.filter((s) => s.id !== product.id);

          const updatedReturnProducts = [
            ...returnProducts.filter((p) => p.id !== product.id),
            {
              ...selected,
              qty: newReturnQty,
              total: newReturnQty * selected.mrp,
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
                  <ArrowDown size={16} className="cursor-pointer" />
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
                <Button onClick={handleFullReturn}>
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
