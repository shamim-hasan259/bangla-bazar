"use client";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { format, formatDate } from "date-fns";
import { Calendar as CalendarIcon, Plus, SendHorizonal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { columns } from "./columns";
import { CreateOrderDataTable } from "./data-table";
import SearchProduct from "@/components/ui/searchProduct";
import { searchProductById } from "../../products/_action";
import { InfoCard } from "./InfoCard";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/redux-store/store";
import {
  setCustomerId,
  setDeliveryAddress,
  setDeliveryDates,
  setNote,
  setPreviousDue,
  setProducts,
  setReturnProducts,
  setUserId,
  setVatCallanNo,
  setVehicleNo,
  setWarehouseId,
} from "@/app/redux-store/Slice/SalesSlice";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { addToDb, addToReturnDb } from "@/lib/salesDb";
import SelectCustomer from "@/components/ui/SelectCustomer";
import { useSession } from "next-auth/react";
import { ReturnDataTable } from "./return-data-table";
import { returnColumn } from "./return-product-column";
import CustomerForm from "../../customer/CustomerForm";
import { CustomerDw, getCustomerById } from "../../customer/_action";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
// import { OnlyReturnTable } from "./return-order-data-table";

interface ProductFormEditProps {
  entry: any;
}

const data: any = [];

function CreateOrderForm({ }) {
  const [date, setDate] = useState<Date>();
  const [open, setOpen] = useState<boolean>(false);
  const [customerDW, setCustomerDW] = useState<any>([
    { value: "", label: "Select Customer" },
  ]);

  const dispatch = useDispatch();
  const { data: session } = useSession();
  const form = useForm();

  //  ("returnActivate", returnActivate);

  const handleCustomerId = async (id: string) => {
    //@ts-ignore
    dispatch(setCustomerId(id));

    try {
      const customer = await getCustomerById(id);
      dispatch(setPreviousDue(customer?.due));
    } catch (error) {
      console.error("Error fetching customer:", error);
    }
  };

  const onSearchChange = (query: any) => {
    query;
  };

  const salesData = useSelector((state: RootState) => state.salesSlice);

  //  ("SaleData", salesData)
  //getting user information

  //@ts-ignore
  const sessionUserId = session?.user?.id;
  //@ts-ignore
  const sessionUserWarehouseId = session?.user?.warehouseId;

  useEffect(() => {
    dispatch(setUserId(sessionUserId));
    dispatch(setWarehouseId(sessionUserWarehouseId));
  }, [sessionUserId]);

  //product selection function
  const handleSelectedProduct = async (productId: string) => {
    try {
      // TODO:: check if Return
      if (salesData.returnActive) {
        // TODO: IF RETURN
        // Check if exist
        const exist = salesData.returnProducts.find(
          (poProduct: any) => poProduct.id === productId
        );
        const rest = salesData.returnProducts.filter(
          (poProduct: any) => poProduct.id !== productId
        );
        //  (salesData.returnProducts, rest, exist);
        let newProduct;
        if (exist) {
          // increase qty
          newProduct = {
            ...exist,
            qty: exist.qty + 1,
            total: (exist.qty + 1) * exist.price,
          };
          addToReturnDb(newProduct);
          dispatch(setReturnProducts([...rest, newProduct]));
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
            order: salesData.returnProducts.length + 1,
            closingQty: product.closingQty,
            qty: 1,
            categoryId: product.categoryId,
            price: product?.price ? product?.price : 0,
            // @ts-ignore
            total: 1 * product?.tp,
          };
        }

        if (salesData.returnActive) {
          addToReturnDb(newProduct);
          const product = [...rest, newProduct];
          //  ("return product", product);
          //  ("return product", product);
          dispatch(setReturnProducts([...rest, newProduct]));
        } else {
          addToDb(newProduct);
          dispatch(setProducts([...rest, newProduct]));
        }
      } else {
        // TODO: Not Return
        // Check if exist
        const exist = salesData.products.find(
          (poProduct: any) => poProduct.id === productId
        );
        const rest = salesData.products.filter(
          (poProduct: any) => poProduct.id !== productId
        );
        //  (salesData.products, rest, exist);
        let newProduct;
        if (exist) {
          // increase qty
          const discount =
            ((exist.qty + 1) *
              exist.price *
              parseFloat(salesData?.discountPercentage)) /
            100;
          newProduct = {
            ...exist,
            qty: exist.qty + 1,
            total: (exist.qty + 1) * exist.price,
            discount: parseFloat(discount.toFixed(2)),
            cogs: (exist.qty + 1) * exist.tp,
          };
          //  ("restProduct", rest);
          dispatch(setProducts(rest));
          addToDb(newProduct);
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
            cogs: product.tp,
            categoryId: product.categoryId,
            closingQty: product.closingQty,
            order: salesData.products.length + 1,
            price: product.price,
            qty: 1,
            discount:
              // @ts-ignore
              parseFloat(
                (
                  (1 *
                    product?.price *
                    parseFloat(salesData?.discountPercentage)) /
                  100
                ).toFixed(2)
              ),
            // @ts-ignore
            total: 1 * product?.price,
          };
        }

        if (salesData.returnActive) {
          addToReturnDb(newProduct);
          const product = [...rest, newProduct];
          //  ("return product", product);
          //  ("return product", product);
          dispatch(setReturnProducts([...rest, newProduct]));
        } else {
          addToDb(newProduct);
          dispatch(setProducts([...rest, newProduct]));
        }
      }
    } catch (error) {
      console.error("Error fetching product by id:", error);
    }
  };
  const soldProducts = salesData?.soldProducts;

  //fething customer dropdown list
  const fetchCustomer = async () => {
    try {
      const customerData = await CustomerDw();
      setCustomerDW(customerData);
      //  ("customerData", customerData);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, []);

  const handleDeliveryDateChange = (date: any) => {
    //  (formatDateTime(date));
    dispatch(setDeliveryDates(date));
  };

  return (
    <div className="flex mb-4">
      <Form {...form}>
        <form
          //@ts-ignore
          // onSubmit={form.handleSubmit()}
          className="w-full space-y-4"
        >
          <div className="flex w-full">
            <div className="w-2/3 mx-4 ">
              <div className="flex items-center py-2 w-full  gap-4">
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
                          <SelectCustomer
                            handleSelect={handleCustomerId}
                            selectedValue={salesData?.customerId}
                            data={customerDW}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="scroll">
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button className="" type="button" variant="seller">
                          <Plus className="mr-2 h-4 w-4" /> Add
                        </Button>
                      </SheetTrigger>
                      <SheetContent>
                        <SheetHeader>
                          <SheetTitle>Creat New Customer</SheetTitle>
                          <SheetDescription>
                            <CustomerForm entry={[]} setOpen={setOpen} />
                          </SheetDescription>
                        </SheetHeader>
                      </SheetContent>
                    </Sheet>
                  </div>
                </div>
              </div>

              {/* table, search, import */}
              {/* PRODUCT CART */}
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-0">
                {salesData?.returnActive ? (
                  <div className="">
                    <ReturnDataTable
                      columns={columns}
                      data={
                        salesData?.returnProducts?.length > 0
                          ? salesData?.returnProducts
                            ?.slice()
                            // @ts-ignore
                            .sort((a, b) => b.order - a.order)
                          : []
                      }
                    />
                  </div>
                ) : (
                  <CreateOrderDataTable
                    columns={columns}
                    // @ts-ignore
                    data={
                      salesData?.products?.length > 0
                        ? salesData?.products
                          ?.slice()
                          // @ts-ignore
                          .sort((a, b) => b.order - a.order)
                        : []
                    }
                  />
                )}
              </div>

              {/* INVOICe INFO */}
              <div className="flex gap-2">
                <div className="w-1/3">
                  <label htmlFor="vatChalanNumber" className="text-sm">
                    Vat Challan Number
                  </label>
                  <Input
                    id="vatChalanNumber"
                    className="w-full"
                    placeholder="Vat Challan Number" //@ts-ignore
                    onChange={(e) => dispatch(setVatCallanNo(e.target.value))}
                    value={salesData?.vatChalanNumber}
                  />
                </div>
                <div className="w-1/3">
                  <label htmlFor="vehicleNumber" className="text-sm">
                    Vehicle Number
                  </label>
                  <Input
                    id="vehicleNumber"
                    className="w-full"
                    placeholder="Vehicle Number" //@ts-ignore
                    onChange={(e) => dispatch(setVehicleNo(e.target.value))}
                    value={salesData?.vehicleNumber}
                  />
                </div>
                <div className="w-1/3">
                  <label htmlFor="deliveryDate" className="text-sm">
                    Delivery Date
                  </label>
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="">
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !salesData?.deliveryDate &&
                                  "text-muted-foreground"
                                )}
                              >
                                {salesData?.deliveryDate ? (
                                  formatDate(salesData?.deliveryDate, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={salesData?.deliveryDate}
                              onSelect={(date) => {
                                // field.onChange(date);
                                handleDeliveryDateChange(date);
                              }}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <div className="mt-2 w-1/2">
                  <label htmlFor="deliveryAddress" className="text-sm mt-2">
                    Delivery Address
                  </label>
                  <Textarea
                    id="deliveryAddress"
                    placeholder="Enter Delivery Address..."
                    className="h-12 mt-[-4]"
                    onChange={(e) =>
                      dispatch(setDeliveryAddress(e.target.value))
                    }
                  />
                </div>
                <div className="mt-2 w-1/2">
                  <label htmlFor="deliveryAddress" className="text-sm mt-2">
                    Note
                  </label>
                  <Textarea
                    id="deliveryAddress"
                    placeholder="Note..."
                    className="h-12 mt-[-4]"
                    onChange={(e) => dispatch(setNote(e.target.value))}
                  />
                </div>
              </div>
            </div>

            {/* invoice form */}
            <div className="w-1/3 mx-4">
              {
                //@ts-ignore
                <InfoCard salesData={salesData} />
              }
              {/* {returnActive && <div>Return is Active</div>} */}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default CreateOrderForm;
