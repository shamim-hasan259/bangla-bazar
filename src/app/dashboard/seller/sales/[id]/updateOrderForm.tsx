"use client";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Plus, SendHorizonal } from "lucide-react";
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
import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import { columns } from "../create-order/columns";
import { orderColumn } from "../create-order/soldProductColumn";
import { CreateOrderDataTable } from "../create-order/data-table";
import SearchProduct from "@/components/ui/searchProduct";
import { searchProductById } from "../../products/_action";
import { CreateOrderSchema } from "../create-order/CreateOrderSchema";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/redux-store/store";
import {
  reset,
  setCustomerId,
  setProducts,
  setReturnProducts,
  setUserId,
  setWarehouseId,
} from "@/app/redux-store/Slice/SalesSlice";
import { addToDb, addToReturnDb } from "@/lib/salesDb";
import SelectCustomer from "@/components/ui/SelectCustomer";
import { useSession } from "next-auth/react";
import { log } from "console";
import { ReturnDataTable } from "../create-order/return-data-table";
import { returnColumn } from "../create-order/return-product-column";
import { Skeleton } from "@/components/ui/skeleton";
import { InfoCard } from "./InfoCard";
// import { OnlyReturnTable } from "./return-order-data-table";

interface ProductFormEditProps {
  entry: any;
}

const data: any = [];

function UpdateOrderForm({}) {
  const dispatch = useDispatch();
  const { data: session } = useSession();
  const form = useForm();

  //  ("returnActivate", returnActivate);

  const handleCustomerId = (id: string) => {
    //@ts-ignore
    dispatch(setCustomerId(id));
  };

  const onSearchChange = (query: any) => {
    query;
  };

  const salesData = useSelector((state: RootState) => state.sales);
  //getting user information
  //@ts-ignore
  const sessionUserId = session?.user?.id;
  //@ts-ignore
  // const sessionUserWarehouseId = session?.user?.warehouseId;

  useEffect(() => {
    dispatch(setUserId(sessionUserId));
    // dispatch(setWarehouseId(sessionUserWarehouseId));
  }, [sessionUserId]);

  //product selection function
  // const handleSelectedProduct = async (productId: string) => {
  //   try {
  //     // TODO:: check if Return
  //     if (salesData.returnActive) {
  //       // TODO: IF RETURN
  //       // Check if exist
  //       const exist = salesData.returnProducts.find(
  //         (poProduct: any) => poProduct.id === productId
  //       );
  //       const rest = salesData.returnProducts.filter(
  //         (poProduct: any) => poProduct.id !== productId
  //       );
  //        (salesData.returnProducts, rest, exist);
  //       let newProduct;
  //       if (exist) {
  //         // increase qty
  //         newProduct = {
  //           ...exist,
  //           qty: exist.qty + 1,
  //           total: (exist.qty + 1) * exist.tp,
  //         };
  //         addToReturnDb(newProduct);
  //         dispatch(setReturnProducts([...rest, newProduct]));
  //       } else {
  //         // add new
  //         const product = await searchProductById(productId);

  //         newProduct = {
  //           id: product?.id,
  //           name: product?.name,
  //           articleCode: product?.articleCode,
  //           //@ts-ignore
  //           mrp: product?.mrp !== null ? product.mrp : 0,
  //           tp: product?.tp !== null ? product.tp : 0,
  //           hsCode: product.hsCode,
  //           openingQty: product.openingQty,
  //           cogs: product.cogs,
  //           order: salesData.returnProducts.length + 1,
  //           closingQty: product.closingQty,
  //           qty: 1,
  //           // @ts-ignore
  //           total: 1 * product?.tp,
  //         };
  //       }

  //       if (salesData.returnActive) {
  //         addToReturnDb(newProduct);
  //         const product = [...rest, newProduct];
  //          ("return product", product);
  //          ("return product", product);
  //         dispatch(setReturnProducts([...rest, newProduct]));
  //       } else {
  //         addToDb(newProduct);
  //         dispatch(setProducts([...rest, newProduct]));
  //       }
  //     } else {
  //       // TODO: Not Return
  //       // Check if exist
  //       const exist = salesData.products.find(
  //         (poProduct: any) => poProduct.id === productId
  //       );
  //       const rest = salesData.products.filter(
  //         (poProduct: any) => poProduct.id !== productId
  //       );
  //        (salesData.products, rest, exist);
  //       let newProduct;
  //       if (exist) {
  //         // increase qty
  //         newProduct = {
  //           ...exist,
  //           qty: exist.qty + 1,
  //           total: (exist.qty + 1) * exist.tp,
  //         };
  //         dispatch(setProducts(rest));
  //         addToDb(newProduct);
  //         dispatch(setProducts([...rest, newProduct]));
  //       } else {
  //         // add new
  //         const product = await searchProductById(productId);

  //         newProduct = {
  //           id: product?.id,
  //           name: product?.name,
  //           articleCode: product?.articleCode,
  //           //@ts-ignore
  //           mrp: product?.mrp !== null ? product.mrp : 0,
  //           tp: product?.tp !== null ? product.tp : 0,
  //           hsCode: product.hsCode,
  //           openingQty: product.openingQty,
  //           cogs: product.cogs,
  //           closingQty: product.closingQty,
  //           order: salesData.products.length + 1,
  //           qty: 1,
  //           // @ts-ignore
  //           total: 1 * product?.tp,
  //         };
  //       }

  //       if (salesData.returnActive) {
  //         addToReturnDb(newProduct);
  //         const product = [...rest, newProduct];
  //          ("return product", product);
  //          ("return product", product);
  //         dispatch(setReturnProducts([...rest, newProduct]));
  //       } else {
  //         addToDb(newProduct);
  //         dispatch(setProducts([...rest, newProduct]));
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error fetching product by id:", error);
  //   }
  // };
  const resetTables = () => {
    dispatch(reset());
  };

  useEffect(() => {
    resetTables();
  }, []);
  const soldProducts = salesData?.soldProducts;

  return (
    <div className="flex">
      <Form {...form}>
        <form
          //@ts-ignore
          onSubmit={form.handleSubmit()}
          className="w-full space-y-4"
        >
          <div className="flex w-full">
            <div className="w-2/3 mx-4 ">
              {/* <div className="flex items-center py-2 flex w-full  gap-4">
                  <FormField
                    control={form.control}
                    name="productSearch"
                    render={({ field }) => (
                      <FormItem className="w-2/3">
                        <FormControl>
                          <SearchProduct handleSelect={handleSelectedProduct} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-between w-1/3">
                    <FormField
                      control={form.control}
                      name="customerId"
                      render={({ field }) => (
                        <FormItem style={{ width: "70%" }}>
                          <FormControl>
                            <SelectCustomer handleSelect={handleCustomerId} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button className="">
                      <Plus className="mr-2 h-4 w-4" /> Add
                    </Button>
                  </div>
                </div> */}

              {/* table, search, import */}
              {soldProducts.length >= 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-0">
                  <p className="text-sm font-bold mb-[-10px]">Sold Product</p>

                  <div className="h-[40vh] overflow-y-scroll ">
                    <ReturnDataTable
                      columns={salesData.id != "" ? orderColumn : columns}
                      data={soldProducts
                        ?.slice()
                        // @ts-ignore
                        .sort((a, b) => a.order - b.order)}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <Skeleton className="h-[30px] w-full mt-2" />
                  <Skeleton className="h-[30px] w-full mt-2" />
                  <Skeleton className="h-[30px] w-full mt-2" />
                  <Skeleton className="h-[30px] w-full mt-2" />
                  <Skeleton className="h-[30px] w-full mt-2" />
                  <Skeleton className="h-[30px] w-full mt-2" />
                  <Skeleton className="h-[30px] w-full mt-2" />
                  <Skeleton className="h-[30px] w-full mt-2" />
                </div>
              )}
              {soldProducts.length >= 0 ? (
                <>
                  <p className="text-sm font-bold mb-2 mt-2">Return Product</p>
                  <div className="h-[40vh] overflow-y-scroll ">
                    <ReturnDataTable
                      columns={returnColumn}
                      data={salesData?.returnProducts}
                    />
                  </div>
                </>
              ) : (
                <div>
                  <Skeleton className="h-[30px] w-full mt-2" />
                  <Skeleton className="h-[30px] w-full mt-2" />
                  <Skeleton className="h-[30px] w-full mt-2" />
                  <Skeleton className="h-[30px] w-full mt-2" />
                  <Skeleton className="h-[30px] w-full mt-2" />
                  <Skeleton className="h-[30px] w-full mt-2" />
                  <Skeleton className="h-[30px] w-full mt-2" />
                  <Skeleton className="h-[30px] w-full mt-2" />
                </div>
              )}
            </div>

            {/* invoice form */}
            <div className="w-1/3 mx-4">
              {soldProducts.length >= 0 ? (
                //@ts-ignore
                // <InfoCard salesData={salesData} />
                <InfoCard salesData={salesData} />
              ) : (
                <Skeleton className="h-full w-full mt-2" />
              )}
              {/* {returnActive && <div>Return is Active</div>} */}
            </div>
          </div>
        </form>
      </Form>
      <Toaster />
    </div>
  );
}

export default UpdateOrderForm;
