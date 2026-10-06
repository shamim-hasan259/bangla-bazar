"use client";
import { Input } from "@/components/ui/input";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import productPhoto from "./img/product.jpg";
import Image from "next/image";
import { DevTool } from "@hookform/devtools";
import SelectSupplier from "@/components/ui/SelectSupplier";
import SelectMc from "@/components/ui/SelectMc";
import SelectCategory from "@/components/ui/SelectCategory";
import SelectBrand from "@/components/ui/SelectBrand";
import SelectUnit from "@/components/ui/SelectUnit";
import { columns } from "./columns";
import { AdjustDataTable } from "./data-table";
import { AdjustFormSchema } from "./AdjustFormSchema";
import SelectWarehouse from "@/components/ui/SelectWareHouse";
import SearchProduct from "@/components/ui/searchProduct";
import CsvUpload from "@/components/CsvUpload";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/redux-store/store";
import {
  setProducts,
  setUserId,
  setWareHouseId,
} from "@/app/redux-store/Slice/AdjustSlice";
import { searchProductById } from "../../products/_action";
import { useSession } from "next-auth/react";
import { saveAdjust } from "../_action";

interface ProductFormEditProps {
  entry: any;
}
const data: any = [];
function AdjustForm({ entry }: ProductFormEditProps) {
  const [id, setId] = useState<string>("");
  const dispatch = useDispatch();
  const form = useForm();
  const { data: session } = useSession();
  //@ts-ignore
  const sessionUserId = session?.user?.id;

  useEffect(() => {
    if (entry?.id) {
      setId(entry?.id);
    }
  }, []);

  useEffect(() => {
    dispatch(setUserId(sessionUserId));
  }, [session]);

  const adjustData = useSelector((state: RootState) => state.adjust);
  const handleSelectedProduct = async (productId: string) => {
    try {
      // Check if exist
      const exist = adjustData?.products.find(
        (adjustProduct: any) => adjustProduct.id === productId
      );
      const rest = adjustData?.products.filter(
        (adjustProduct: any) => adjustProduct.id !== productId
      );
      let newProduct;
      if (exist) {
        // inrease qty

        newProduct = {
          ...exist,
          qty: parseInt(exist.qty) + 1,
          total: parseInt(exist.qty + 1) * exist.tp,
        };
        dispatch(setProducts(rest));
        localStorage.setItem("adjust", JSON.stringify([...rest, newProduct]));
        dispatch(setProducts([...rest, newProduct]));
      } else {
        // add new
        const product = await searchProductById(productId);

        newProduct = {
          id: product?.id,
          name: product?.name,
          articleCode: product?.articleCode,
          //@ts-ignore
          mrp: product?.mrp !== null ? product.mrp : 0,
          tp: product?.tp !== null ? product.tp : 0,
          hsCode: product.hsCode,
          openingQty: product.openingQty,
          cogs: product.cogs,
          closingQty: product.closingQty,
          order: adjustData.products.length + 1,
          qty: 1,
          // @ts-ignore
          total: 1 * product?.tp,
          type: "",
        };
      }

      dispatch(setProducts([...rest, newProduct]));
    } catch (error) {
      console.error("Error fetching product by id:", error);
    }
  };

  const handleWarehouse = (id: string) => {
    // form.setValue("warehouseId", id);
    dispatch(setWareHouseId(id));
  };

  const [CSV, setCSV] = useState<any>([]);
  const handelImport = async () => {
    //  ("Import", CSV);
    if (CSV?.length > 0) {
      //  const product = await importProduct(CSV);
      //  if (product) {
      //    toast.success("Product Import Success");
      //  }
    }
  };

  async function onSubmit() {
    try {
      //@ts-ignore
      const product = await saveAdjust(adjustData);
      if (product) {
        form.reset();
        toast.success(
          id ? "Product Update Success" : "Product Creation Success"
        );
      } else {
        toast.error(id ? "Product Update faield!" : "Product Creation faield!");
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="flex pt-8">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-4"
        >
          <div className="flex w-full  ">
            <div className="w-full mx-4 ">
              {/* masterCategory, shCode, salesType */}
              <div className=" flex items-center justify-between gap-2">
                <div className="w-1/2">
                  <FormField
                    control={form.control}
                    name="productSearch"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <SearchProduct handleSelect={handleSelectedProduct} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex w-1/2 gap-2">
                  <div className="w-1/2 mt-4">
                    <FormField
                      control={form.control}
                      name="supplierId"
                      render={({ field }) => (
                        <FormItem>
                          {/* <FormLabel>Warehouse </FormLabel> */}
                          <FormControl>
                            <SelectWarehouse handleSelect={handleWarehouse} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <CsvUpload setCSV={setCSV} handelImport={handelImport} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-0">
                <AdjustDataTable
                  columns={columns}
                  data={
                    adjustData?.products?.length > 0
                      ? adjustData?.products
                          ?.slice()
                          // @ts-ignore
                          .sort((a, b) => a.order - b.order)
                      : entry?.products
                          ?.slice()
                          // @ts-ignore
                          .sort((a, b) => a.order - b.order)
                  }
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 pb-2 border-b">
                <p className="font-bold">
                  Recive Adjustment Qty: <span>{adjustData?.adjustRcvQty}</span>
                </p>
                <p className="font-bold">
                  Recive Adjustment Total:{" "}
                  <span>{adjustData?.rcvAdjustTotal}</span> TK
                </p>
                <p className="font-bold">
                  Issue Adjustment Qty:{" "}
                  <span>{adjustData?.issueAdjustQty}</span>
                </p>
                <p className="font-bold">
                  Issue Adjustment Total:{" "}
                  <span>{adjustData?.issueAdjustTotal}</span> TK
                </p>
              </div>
            </div>
          </div>

          <div className="w-full flex justify-end">
            <Button type="submit" className="mr-4">
              Reset Cart
            </Button>
            <Button type="submit" className="mr-4">
              Submit
            </Button>
          </div>
        </form>
        {/* <DevTool control={form.control} /> */}
      </Form>
      <Toaster />
    </div>
  );
}

export default AdjustForm;
