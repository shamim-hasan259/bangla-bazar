"use client";

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
import { ArrowUpDown, Barcode, MoreHorizontal, X } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Toast } from "@/components/ui/toast";
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/redux-store/store";
import {
  setProducts,
  setReturnProducts,
} from "@/app/redux-store/Slice/SalesSlice";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

export type Product = {
  id: string;
  name: string;
  photo: string;
  status: "Active" | "Inactive";
  mrp: number;
  articleCode: string;
  stock: number;
};


export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "no",
    header: "#",
    cell: ({ row }: { row: any }) => {
      const sl = row.index + 1; // row.index gives the zero-based index, add 1 to make it 1-based

      return `${sl}.`;
    },
  },
  {
    accessorKey: "articleCode",
    header: "Article Code",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "price",
    header: "Price",
  },
  {
    accessorKey: "qty",
    header: "Quantity",
    cell: ({ row, table }) => {
      const product = row.original;
      const dispatch = useDispatch();
      const salesData = useSelector((state: RootState) => state.sales);
      const handleQtyChange = (e: number) => {
        if (salesData.returnActive === true) {
          const exist = salesData.returnProducts.find(
            (saleProduct: any) => saleProduct.id === product.id
          );
          const rest = salesData.returnProducts.filter(
            (saleProduct: any) => saleProduct.id !== product.id
          );
          let newProduct;
          if (exist) {
            // inrease qty

            newProduct = {
              ...exist,
              qty: parseInt(e.target.value),
              total:
                parseInt(e.target.value) * exist.price -
                (parseInt(e.target.value) *
                  exist.price *
                  parseFloat(salesData?.discountPercentage)) /
                  100,
              discount:
                (e.target.value *
                  exist.price *
                  parseFloat(salesData?.discountPercentage)) /
                100,
            };
            dispatch(setReturnProducts(rest));

            dispatch(setReturnProducts([...rest, newProduct]));
          } else {
          }
        } else {
          const exist = salesData.products.find(
            (saleProduct: any) => saleProduct.id === product.id
          );
          const rest = salesData.products.filter(
            (saleProduct: any) => saleProduct.id !== product.id
          );
          let newProduct;
          if (exist) {
            // inrease qty

            newProduct = {
              ...exist,
              qty: parseInt(e.target.value),
              total:
                parseInt(e.target.value) * exist.price -
                (parseInt(e.target.value) *
                  exist.price *
                  parseFloat(salesData?.discountPercentage)) /
                  100,
              discount:
                (e.target.value *
                  exist.price *
                  parseFloat(salesData?.discountPercentage)) /
                100,
            };
            dispatch(setProducts(rest));

            dispatch(setProducts([...rest, newProduct]));
          } else {
          }
        }
      };

      return (
        <input
          type="number"
          //@ts-ignore
          value={product?.qty}
          //@ts-ignore
          onChange={handleQtyChange}
          className="w-full border rounded p-1"
        />
      );
    },
  },
  {
    accessorKey: "discount",
    header: "Discount",
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => {
      const total = row.original.total;
      return total.toFixed(2);
    },
  },
  {
    accessorKey: "action",
    header: "Action",
    id: "actions",
    cell: ({ row }) => {
      const sale = row.original;
      const dispatch = useDispatch();
      const salesData = useSelector((state: RootState) => state.sales);
      // const products = salesData?.products;
      // const returnProducts = salesData?.returnProducts;
      // const [isSelected, setIsSelected] = useState(false);

      const handleRemoveProduct = () => {
        "hello", salesData;
        if (salesData.returnActive === true) {
          const updatedProducts = salesData.returnProducts.filter(
            (product: any) => product.id !== sale.id
          );
          //  ("updatedProducts", updatedProducts);
          dispatch(setReturnProducts(updatedProducts));
        } else {
          const updatedProducts = salesData.products.filter(
            (product: any) => product.id !== sale.id
          );
          //  ("updatedProducts", updatedProducts);
          dispatch(setProducts(updatedProducts));
        }
      };

      return <X className="cursor-pointer" onClick={handleRemoveProduct} />;
    },
  },
];
