"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarIcon,
  CheckSquare,
  Loader2,
  Printer,
  RotateCcw,
  Square,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import {
  reset,
  resetProducts,
  setCardAmount,
  setCardName,
  setCash,
  setChequeAmount,
  setChequeBank,
  setChequeNo,
  setCurrentDueCloseDate,
  setDiscount,
  setDiscountPercentage,
  setMfsAmount,
  setMfsName,
} from "@/app/redux-store/Slice/SalesSlice";
import { RootState } from "@/app/redux-store/store";
import { createOrder } from "./../_action";
import { SalePrintLog } from "@/components/ui/sell-print-pop";
import { SaleReturnPrint } from "@/components/ui/sell-return-print";
import { useRouter } from "next/navigation";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { formatDate } from "date-fns";
import { updateCustomerDue } from "../../customer/_action";
import Loader from "@/components/ui/Loader";
import { createUserLogs } from "../../users/_action";

//@ts-ignore
export function InfoCard() {
  const dispatch = useDispatch();
  const form = useForm();
  const router = useRouter();
  const [loader, setLoader] = useState(false);
  const [activate, setActive] = useState(false);
  const [savedData, setSavedData] = useState();
  const [alertOpen, setAlertOpen] = useState(false);
  const [checkPaymentActive, setCheckPaymentActive] = useState(false);
  const salesData = useSelector((state: RootState) => state.sales);

  const loaderClose = () => setLoader(false);
  const loaderShow = () => setLoader(true);

  // submit order funciton
  //TODO::WORK WITH SUMBIT DATA

  // TODO::
  //✅ Check required data field and provide proper notification
  //✅ check and apply all conditions before submit
  //✅ work with individual product discount
  //✅ when cleck submit pop confirm, if confirm hide confirm pop and show loader
  //✅ add loader for for submit and load print after successful submit

  //update products stock
  //update customer due
  //update collections -> transactions
  //reset slice data after sale.

  //CONDITIONS
  //✅ products must have min one products [due|generate|order]
  //✅  if isDue then true the recived amount can be less than 0
  //✅ if billActive true then recived amount should not be less than grossTotal
  //✅ customer must need to be selected
  //✅ returnActive active then products and soldProducts must be empty & return products should have min one product

  const generateOrder = async () => {
    const order = await createOrder(salesData);
    if (order) {
      setActive(true);
      //@ts-ignore
      setSavedData(order);

      // Dispatch the reset action to clear the poSlice
      dispatch(reset());
      // Clear relevant local storage items
      createUserLogs(order?.userId, order?.invoiceId, "Return Sale", "Create");
      localStorage.removeItem("sales_cart");
      toast.success("Order Creation Success 😃");
      router.push("/dashboard/sales");
    } else {
      toast.success("Order Creation Failed! ❌");
    }
  };

  //@ts-ignore
  const onSubmit = async (e) => {
    // Disable ddefault behaviour
    e.preventDefault();
    // disable pop
    setAlertOpen(false);
    //show loader

    try {
      setLoader(true);
      //@ts-ignore
      // const order = await saveOrder(salesData);
      if (salesData?.customerId !== "") {
        // toast.success("Customer Selected");
        if (salesData?.billActive === true) {
          if (salesData?.soldProducts?.length > 0) {
            // if billActive true then recived amount should not be less than grossTotal
            if (salesData?.totalRecieved >= salesData?.grossTotalRound) {
              generateOrder();
            } else {
              toast.error(
                "Total Recieved Amount Must by grater than GorssTotal when Generate Bill"
              );
            }
          } else {
            toast.error("You Must Select Product for Generate Bill");
          }
        } else if (salesData?.isDue === true) {
          if (salesData?.soldProducts?.length > 0) {
            // if isDue true then recived amount should not be less than grossTotal
            if (salesData?.currentDueCloseDate != new Date()) {
              generateOrder();
            } else {
              toast.error(
                "Total Recieved Amount Must by grater than GorssTotal when Generate Bill"
              );
            }
          } else {
            toast.error("You Must Select Product for Generate Due Bill");
          }
        } else if (salesData?.returnActive === true) {
          if (salesData?.returnProducts?.length > 0) {
            // if returnActive true then recived amount should not be less than grossTotal
            // if (salesData?.totalRecieved > 0) {
            generateOrder();
            // } else {
            //   toast.error("Total Recieved Amount Must by grater than GorssTotal when Generate Bill");
            // }
          } else {
            toast.error("You Must Select Product for Void Return");
          }
        } else {
          if (salesData?.soldProducts?.length > 0) {
            generateOrder();
          } else {
            toast.error("You must select product for generate order");
          }
        }
      } else {
        toast.error("Customer Must be Selected Before Genetate Invoice");
      }
    } catch (error) {
      console.error(error);
    }
    loaderClose();
  };

  //  ("infoCardDaa", salesData);

  return (
    <>
      <div className="w-full flex justify-between border-b pb-4 font-bold">
        <p>Finalize Order</p>
      </div>
      <div className="w-full flex justify-between mt-4">
        <p className="font-medium">Total Item:</p>
        <p>{salesData?.totalItem}</p>
      </div>
      {salesData.returnProducts.length > 0 && (
        <>
          <div className="w-full flex justify-between mt-4">
            <p className="font-medium">Return Total Item:</p>
            <p>{salesData?.returnCalculation.totalItem}</p>
          </div>
          <div className="w-full flex justify-between mt-4">
            <p className="font-medium">Return Product Total:</p>
            <p>{salesData?.returnCalculation?.total.toFixed(2)} BDT</p>
          </div>
        </>
      )}

      <div className="w-full flex justify-between mt-4">
        <p className="font-medium">Total:</p>
        <p>{salesData?.total.toFixed(2)} BDT</p>
      </div>
      {/* <div className="w-full flex justify-between mt-4">
        <p className="font-medium">Vat/Tax Amount:</p>
        <p>{salesData?.vat} BDT</p>
      </div> */}
      <div className="w-full flex justify-between mt-4">
        <p className="font-medium">Discount:</p>
        <p>{salesData?.discount} BDT</p>
      </div>
      <div className="w-full flex justify-between mt-4">
        <p className="font-medium">Gross Total:</p>
        <p>{salesData?.grossTotal?.toFixed(2)} BDT</p>
      </div>
      <div className="w-full flex justify-between mt-4">
        <p className="font-medium">Gross Total(Round):</p>
        <p>{salesData?.grossTotalRound} BDT</p>
      </div>
      <div className="w-full flex justify-between mt-4">
        <p className="font-medium">Cash Recieved:</p>
        <Input
          className="w-1/3"
          placeholder="0"
          value={salesData?.paidAmount?.cash}
          //@ts-ignore
          onChange={(e) => {
            dispatch(setCash(e.target.value > 0 ? e.target.value : 0));
          }}
        />
      </div>
      <div className="flex justify-between mt-2">
        <div className="flex ">
          <div
            className="flex items-center space-x-2 "
            onClick={() => {
              setCheckPaymentActive(!checkPaymentActive);
              // dispatch(setPaymentMethodType("Cash"))
            }}
          >
            {checkPaymentActive == true ? <CheckSquare /> : <Square />}
            <label
              htmlFor="due"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Cheque :
            </label>
          </div>
        </div>
        <Input
          className="w-1/3"
          placeholder="0" //@ts-ignore
          onChange={(e) =>
            dispatch(setChequeAmount(e.target.value > 0 ? e.target.value : 0))
          }
          value={salesData?.paidAmount?.cheque?.amount}
        />
      </div>
      {checkPaymentActive ? (
        <div className="flex justify-between mt-2 gap-2">
          <Input
            className="w-1/2"
            placeholder="Bank Name" //@ts-ignore
            onChange={(e) => dispatch(setChequeBank(e.target.value))}
            value={salesData?.paidAmount?.cheque?.name}
          />
          <Input
            className="w-1/2"
            placeholder="Cheque Number" //@ts-ignore
            onChange={(e) =>
              dispatch(setChequeNo(e.target.value > 0 ? e.target.value : 0))
            }
            value={salesData?.paidAmount?.cheque?.number}
          />
        </div>
      ) : null}
      <div className="w-full flex justify-between mt-4">
        <p className="font-medium">Card:</p>
        <Select
          // value={cardName && cardName}
          onValueChange={(value: string) => dispatch(setCardName(value))}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Visa" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="visa">Visa</SelectItem>
              <SelectItem value="dbbl">DBBL</SelectItem>
              <SelectItem value="mtb">MTB</SelectItem>
              <SelectItem value="city">City</SelectItem>
              <SelectItem value="amex">Amex</SelectItem>
              <SelectItem value="ebl">EBL</SelectItem>
              <SelectItem value="brac">Brac</SelectItem>
              <SelectItem value="masterCard">Master Card</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Input
          className="w-1/3"
          placeholder="0" //@ts-ignore
          onChange={(e) =>
            dispatch(setCardAmount(e.target.value > 0 ? e.target.value : 0))
          }
          value={salesData?.paidAmount?.card?.amount}
        />
      </div>
      <div className="w-full flex justify-between mt-4">
        <p className="font-medium">MFS:</p>
        <Select
          // value={mfsName && mfsName}
          onValueChange={(value: string) => dispatch(setMfsName(value))}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Bkash" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="bkash">Bkash</SelectItem>
              <SelectItem value="nagad">Nagad</SelectItem>
              <SelectItem value="upay">Upay</SelectItem>
              <SelectItem value="rocket">Rocket</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Input
          className="w-1/3"
          placeholder="0" //@ts-ignore
          onChange={(e) =>
            dispatch(setMfsAmount(e.target.value > 0 ? e.target.value : 0))
          }
          value={salesData?.paidAmount?.mfs?.amount}
        />
      </div>
      <div className="w-full flex justify-between mt-4">
        <div className="flex items-center space-x-2">
          <label
            htmlFor="terms"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Discount
          </label>
        </div>
        <div className="flex items-center border ml-2 rounded">
          <Input
            type="number"
            className="w-2/3"
            value={salesData.discount}
            onChange={(e) => dispatch(setDiscount(parseFloat(e.target.value)))}
          />
          <p className="text-center w-1/3 font-bold">৳</p>
        </div>
        <div className="flex items-center border ml-2 rounded">
          <Input
            type="number"
            className="w-2/3"
            value={salesData.discountPercentage}
            onChange={(e) => dispatch(setDiscountPercentage(e.target.value))}
          />
          <p className="text-center w-1/3 font-extrabold">%</p>
        </div>
      </div>

      <div className="">
        <div className="w-full flex justify-between mt-4">
          <p className="font-medium">Total Recieved:</p>
          <p>{salesData?.totalRecieved} BDT</p>
        </div>
        <div className="w-full flex justify-between mt-4">
          <p className="font-medium">Previous Due:</p>
          <p>{salesData?.prevDueAmount} BDT</p>
        </div>

        <div className="flex justify-between items-center">
          <div className="w-1/2 flex justify-between mt-4">
            <p className="font-medium">Current Due:</p>
            <p>{salesData?.currentDueAmount?.toFixed(2)} BDT</p>
          </div>
          <div className=" flex justify-between mt-4">
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
                            !salesData.currentDueCloseDate &&
                              "text-muted-foreground"
                          )}
                        >
                          {salesData.currentDueCloseDate
                            ? formatDate(salesData.currentDueCloseDate, "PPP")
                            : formatDate(new Date(), "PPP")}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={salesData.currentDueCloseDate}
                        onSelect={(date) => {
                          dispatch(setCurrentDueCloseDate(date));
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
        <div className="w-full flex justify-between mt-4">
          <p className="font-medium">Change Amount:</p>
          <p>{salesData?.changeAmount.toFixed(2)} BDT</p>
        </div>
      </div>

      <Separator orientation="horizontal" className="mt-2" />
      <div className="w-full flex justify-center gap-4  mt-8">
        <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
          {/* <Button onClick={() => dispatch(resetProducts())}>
            <RotateCcw size={18} className="mr-2" /> Reset
          </Button> */}
          <AlertDialogTrigger asChild>
            <Button>
              <Printer size={18} className="mr-2" /> Generate Order
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Are you absolutely sure to procced the Order?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Hey, Dude. Are you sure to process the order?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onSubmit}>
                <Printer size={18} className="mr-2" /> Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Helper Components */}
        {/* <Loader isOpen={loader} onClose={setLoader} /> */}

        <Toaster />
        {/*@ts-ignore */}
        <SaleReturnPrint
          open={activate}
          setOpen={setActive}
          entry={savedData}
        />
      </div>
      <Loader isOpen={loader} onClose={setLoader} title="Please Wait" />
    </>
  );
}
