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
import { DamageFormSchema } from "./DamageFromSchema";
import { DGDataTable } from "./data-table";
import SelectWarehouse from "@/components/ui/SelectWareHouse";
import CsvUpload from "@/components/CsvUpload";
import { AdjustDataTable } from "../../adjust/create/data-table";
import SearchProduct from "@/components/ui/searchProduct";
import {
  setProducts,
  setUserId,
  setWareHouseId,
} from "@/app/redux-store/Slice/DamageSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/redux-store/store";
import { searchProductById } from "../../products/_action";
import { columns } from "./columns";
import { saveDamage } from "../_action";
import { useSession } from "next-auth/react";

interface ProductFormEditProps {
  entry: any;
}
const data: any = [];
function DamageForm({ entry }: ProductFormEditProps) {
  const [id, setId] = useState<string>("");
  const [mcId, setMcId] = useState<string>("");
  const dispatch = useDispatch();
  const { data: session } = useSession();
  //@ts-ignore
  const sessionUserId = session?.user?.id;
  const form = useForm();

  useEffect(() => {
    if (entry?.id) {
      setId(entry?.id);
    }
  }, []);

  useEffect(() => {
    dispatch(setUserId(sessionUserId));
  }, [session]);

  const handleSupplierId = (id: string) => {
    form.setValue("supplierId", id);
  };

  const handleWarehouse = (id: string) => {
    // form.setValue("warehouseId", id);
    dispatch(setWareHouseId(id));
  };

  const damageData = useSelector((state: RootState) => state.damage);
  const handleSelectedProduct = async (productId: string) => {
    try {
      // Check if exist
      const exist = damageData?.products.find(
        (adjustProduct: any) => adjustProduct.id === productId
      );
      const rest = damageData?.products.filter(
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
        dispatch(setProducts([...damageData?.products, newProduct]));
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

  const handleRemoveProduct = (productId: string) => {
    const updatedProducts = damageData.products.filter(
      (product: any) => product.id !== productId
    );
    dispatch(setProducts(updatedProducts));
  };

  //csv Function call
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
      const damage = await saveDamage(damageData);
      if (damage) {
        form.reset();
        toast.success(id ? "Damage Update Success" : "Damage Creation Success");
      } else {
        toast.error(id ? "Damage Update faield!" : "Damage Creation faield!");
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
                <DGDataTable
                  columns={columns}
                  data={damageData?.products ?? []}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 pb-2 border-b">
                <p className="font-bold">
                  Total Item: <span>{damageData?.totalItem}</span>
                </p>
                <p className="font-bold">
                  Total: <span>{damageData?.total}</span> TK
                </p>
                <p className="font-bold">
                  Gross Total: <span>{damageData?.grossTotal}</span>
                </p>
                <p className="font-bold">
                  Grosstotal Round: <span>{damageData?.grossTotalRound}</span>{" "}
                  TK
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

export default DamageForm;
