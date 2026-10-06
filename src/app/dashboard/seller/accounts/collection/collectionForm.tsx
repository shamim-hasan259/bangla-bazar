"use client";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { format, formatDate } from "date-fns";
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
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { redirect, useRouter } from "next/navigation";

import { useEffect, useState } from "react";
import SelectAccountHead from "@/components/ui/SelectAccountHead";
import SelectMCAccountsHead from "@/components/ui/SelectMCAccountsHead";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ArrowLeft, CalendarIcon, CheckSquare, Square } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { useDispatch, useSelector } from "react-redux";
import {
  setAccountHeadId,
  setAmount,
  setCardName,
  setChequeName,
  setChequeNo,
  setBankName,
  setCardNo,
  setAccountNo,
  setMfsName,
  setMfsNumber,
  setName,
  setNote,
  setPaymentMethodType,
  setUpdatedUserId,
  setUserId,
  setDate,
  resetTransaction,
  setInvoiceActive,
  setType,
  setInvoice,
  setCustomer,
  setDue,
  setPreviousDue,
  setPaymentType,
} from "@/app/redux-store/Slice/TransactionsSlice";
import { RootState } from "@/app/redux-store/store";
import { useSession } from "next-auth/react";
import Link from "next/link";
import PageTitle from "@/components/ui/PageTitle";
import SelectCustomer from "@/components/ui/SelectCustomer";
import {
  CustomerDw,
  getCustomerById,
  updateCustomerDue,
} from "../../customer/_action";
import { formatDateTime } from "@/lib/utils";
import SelectInvoice from "@/components/ui/SelectInvoice";
import { invoiceDw, salesWithDue, updateInvoice } from "../../sales/_action";
import { createTransaction } from "../_action";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Loader from "@/components/ui/Loader";

function CollectionForm() {
  const router = useRouter();
  const tsData = useSelector((state: RootState) => state.transactions);

  // const [photoName, setPhotoName] = useState<string>("offer-photo.png");

  // const [cashActive, setCashActive] = useState(true);
  // const [checkActive, setCheckActive] = useState(false);
  // const [cardActive, setCardActive] = useState(false);
  // const [mfsActive, setMfsActive] = useState(false);

  // const [isAdvance, setIsAdvance] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({});
  const [invoiceInfo, setInvoiceInfo] = useState({});
  const [loader, setLoader] = useState(false);
  const loaderClose = () => setLoader(false);
  const loaderShow = () => setLoader(true);

  const [customerDW, setCustomerDW] = useState<any>([
    { value: "", label: "Select Customer" },
  ]);
  const [invoiceDwAmount, setInvoiceDw] = useState<any>([
    { value: "", label: "Select Invoice" },
  ]);

  const dispatch = useDispatch();
  const { data: session } = useSession();

  const form = useForm();

  const handleCustomerId = async (option: string) => {
    //  (option)
    dispatch(setCustomer(option));
    const customerById = await getCustomerById(option);

    if (customerById) {
      setInvoiceInfo({});
      dispatch(setPreviousDue(customerById.due || 0));
      dispatch(setAmount(customerById.due || 0));
      setCustomerInfo(customerById);
    }
  };
  const handleInvoiceId = async (option: string) => {
    const invoiceInfo = await salesWithDue(option);

    //  ("invoiceInfo", invoiceInfo);
    const info = invoiceInfo as any;
    //@ts-ignore
    setCustomerInfo({});
    dispatch(setInvoice(info?.invoiceId));
    dispatch(setCustomer(info?.customer?.id));
    dispatch(setDue(invoiceInfo?.grossTotal));
    dispatch(setAmount(invoiceInfo?.grossTotal));
    dispatch(setPreviousDue(invoiceInfo?.grossTotal));
    //@ts-ignore
    setInvoiceInfo(invoiceInfo);
  };

  //@ts-ignore
  const sessionUserId = session?.user?.id;

  useEffect(() => {
    dispatch(setType("Collection"));
    dispatch(setAccountHeadId("668fd5b50b3838d84eed05e6"));
    dispatch(setUserId(sessionUserId));
    dispatch(setUpdatedUserId(sessionUserId));
  }, [sessionUserId]);

  //  ("collectionsData", tsData);

  const fetchCustomer = async () => {
    try {
      const customerData = await CustomerDw();
      setCustomerDW(customerData);
    } catch (error) {
      console.error(error);
    }
  };

  //  (customerInfo)
  //  (invoiceInfo)

  const fetchInvoice = async () => {
    try {
      const invoiceData = await invoiceDw();
      setInvoiceDw(invoiceData);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchInvoice();
    fetchCustomer();
  }, []);

  //  ("invoiceid", invoiceDw);

  //date change function implement
  // const handleDateChange = (date: any) => {
  //   //  (formatDateTime(date));
  //   dispatch(setDate(date));
  // };

  async function onSubmit() {
    try {
      loaderShow();
      const saveCollections = await createTransaction(tsData);
      if (saveCollections) {
        //  (saveCollections)
        //TODO:: Update Customer Due
        const updateCustomer = await updateCustomerDue(
          tsData.customerId,
          tsData.due
        );
        //  (updateCustomer)
        if (updateCustomer) toast.success("Customer Due Updated!");

        //TODO:: Update invoice || isDue || DuePaid
        const updateSale = await updateInvoice(tsData.invoiceNo, {
          isDue: true,
          duePaid: true,
        });
        //  (updateSale)
        if (updateSale) toast.success("Order Updated!");

        dispatch(resetTransaction());
        toast.success("Collection saved successfully!");
        router.push("/dashboard/accounts");
        loaderClose();
      } else {
        toast.error("Failed to save collection!");
      }
    } catch (err) {
      console.error("collection-error", err);
    }
  }

  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex w-full justify-between items-center">
        <div className="flex">
          <Link href="/dashboard/accounts">
            <Button variant="ghost">
              <ArrowLeft />
            </Button>
          </Link>
          <PageTitle title="Collections" />
        </div>
      </div>
      <div className="w-4/6 mt-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-4"
          >
            <div className="flex">
              {/* SELECT ADVANCE */}
              {!tsData?.isInvoiceActive && (
                <div
                  className={`flex items-center space-x-2 mt-4 mr-8 `}
                  onClick={() => {
                    dispatch(
                      setPaymentType(
                        tsData.paymentType === "Payment" ? "Advance" : "Payment"
                      )
                    );
                  }}
                >
                  {tsData.paymentType === "Advance" ? (
                    <CheckSquare />
                  ) : (
                    <Square />
                  )}
                  <label
                    htmlFor="check"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Advance
                  </label>
                </div>
              )}
              {/* SELECT INVOICE OPTIONS */}
              {tsData.paymentType === "Payment" && (
                <div
                  className={`flex items-center space-x-2 mt-4 `}
                  onClick={() => {
                    dispatch(setInvoiceActive(!tsData?.isInvoiceActive));
                  }}
                >
                  {tsData?.isInvoiceActive === true ? (
                    <CheckSquare />
                  ) : (
                    <Square />
                  )}
                  <label
                    htmlFor="check"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Invoice Wise Collections
                  </label>
                </div>
              )}
            </div>

            <div className="w-full justify-between flex items-center mt-4">
              <div className="w-2/3">
                {tsData?.isInvoiceActive ? (
                  <div className=" mr-2">
                    <p className="text-m mb-2">Select Invoice</p>
                    <FormField
                      control={form.control}
                      name="customerId"
                      render={({ field }) => (
                        <FormItem style={{ width: "100%" }}>
                          <FormControl>
                            <SelectInvoice
                              handleSelect={handleInvoiceId}
                              selectedValue={tsData?.customerId}
                              data={invoiceDwAmount}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />{" "}
                  </div>
                ) : (
                  <div className="mr-2">
                    <p className="text-m mb-2">Select Customer</p>
                    <FormField
                      control={form.control}
                      name="customerId"
                      render={({ field }) => (
                        <FormItem style={{ width: "100%" }}>
                          <FormControl>
                            <SelectCustomer
                              handleSelect={handleCustomerId}
                              selectedValue={tsData?.customerId}
                              data={customerDW}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />{" "}
                  </div>
                )}
              </div>

              <div className="w-1/3">
                <p className="text-m mb-2">Payment Date</p>
                <FormField
                  control={form.control}
                  name="date"
                  render={() => (
                    <FormItem className="">
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full  text-left font-normal",
                                !tsData.date && "text-muted-foreground"
                              )}
                            >
                              {tsData.date ? (
                                format(tsData.date, "PPP")
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
                            selected={tsData.date}
                            onSelect={(date) => dispatch(setDate(date))}
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

            {/* INFO */}
            {(customerInfo as any)?.id && (
              <Alert className="bg-slate-50">
                <AlertTitle>Customer Info</AlertTitle>
                <AlertDescription>
                  <div className="flex justify-between">
                    <b>Company: </b>
                    {(customerInfo as any)?.company} | <b>Name: </b>
                    {(customerInfo as any)?.name} | <b>Previous Due: </b>
                    {(customerInfo as any)?.due || 0} | <b>Due: </b>
                    {tsData?.due}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {(invoiceInfo as any)?.id && (
              <Alert className="bg-slate-50">
                <AlertTitle>Invoice Info</AlertTitle>
                <AlertDescription className="mb-4">
                  <div className="flex justify-between">
                    <span>
                      <b>Invoice No: </b>
                      {(invoiceInfo as any)?.invoiceId}
                    </span>
                    <span>
                      <b>Due Bill: </b>
                      {(invoiceInfo as any)?.duePaid ? "Paid" : "Not Paid"}
                    </span>
                    <span>
                      <b>Date: </b>
                      {format(new Date((invoiceInfo as any)?.createdAt), "dd/mm/yyyy")}
                    </span>
                    <span>
                      <b>Status: </b>
                      {(invoiceInfo as any)?.status}
                    </span>
                  </div>
                </AlertDescription>
                <AlertTitle>Customer Info</AlertTitle>
                <AlertDescription>
                  <div className="flex justify-between">
                    <span>
                      <b>Company: </b>
                      {(invoiceInfo as any)?.customer?.company}
                    </span>
                    <span>
                      <b>Name: </b>
                      {(invoiceInfo as any)?.customer?.name}
                    </span>
                    <span>
                      <b>Invoice Due: </b>
                      {(invoiceInfo as any)?.grossTotal}
                    </span>
                    <span>
                      <b>Due: </b>
                      {tsData?.due}
                    </span>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* INFO */}

            <div>
              <p>Payment Method</p>
              <div className="flex gap-16">
                <div
                  className="flex items-center space-x-2 mt-4"
                  onClick={() => {
                    dispatch(setPaymentMethodType("Cash"));
                  }}
                >
                  {tsData.paymentMethodType == "Cash" ? (
                    <CheckSquare />
                  ) : (
                    <Square />
                  )}
                  <label
                    htmlFor="cash"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Cash
                  </label>
                </div>
                <div
                  className="flex items-center space-x-2 mt-4"
                  onClick={() => {
                    dispatch(setPaymentMethodType("Bank"));
                  }}
                >
                  {tsData.paymentMethodType == "Bank" ? (
                    <CheckSquare />
                  ) : (
                    <Square />
                  )}
                  <label
                    htmlFor="Bank"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Bank
                  </label>
                </div>
                <div
                  className="flex items-center space-x-2 mt-4"
                  onClick={() => {
                    dispatch(setPaymentMethodType("Cheque"));
                  }}
                >
                  {tsData.paymentMethodType == "Cheque" ? (
                    <CheckSquare />
                  ) : (
                    <Square />
                  )}
                  <label
                    htmlFor="Cheque"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Cheque
                  </label>
                </div>
                <div
                  className="flex items-center space-x-2 mt-4"
                  onClick={() => {
                    dispatch(setPaymentMethodType("Card"));
                  }}
                >
                  {tsData.paymentMethodType == "Card" ? (
                    <CheckSquare />
                  ) : (
                    <Square />
                  )}
                  <label
                    htmlFor="card"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Card
                  </label>
                </div>
                <div
                  className="flex items-center space-x-2 mt-4"
                  onClick={() => {
                    dispatch(setPaymentMethodType("MFS"));
                  }}
                >
                  {tsData.paymentMethodType == "MFS" ? (
                    <CheckSquare />
                  ) : (
                    <Square />
                  )}
                  <label
                    htmlFor="mfs"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    MFS
                  </label>
                </div>
              </div>
            </div>

            {/* Options for paments */}
            <div className="w-full">
              {/* COMMON */}
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={() => (
                    <FormItem className="w-full">
                      <FormLabel>Responsible Person Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Name"
                          onChange={(e) => dispatch(setName(e.target.value))}
                          value={tsData.name}
                        />
                      </FormControl>
                      {/* <FormDescription>
                            This is your public display name.
                        </FormDescription> */}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="amount"
                          onChange={(e) => {
                            dispatch(
                              setAmount(
                                parseFloat(e.target.value) > 0
                                  ? parseFloat(e.target.value)
                                  : 0
                              )
                            );
                          }}
                          value={tsData.amount}
                        />
                      </FormControl>
                      {/* <FormDescription>
                            This is your public display name.
                        </FormDescription> */}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* MFS */}
              {tsData.paymentMethodType === "MFS" && (
                <div className="flex justify-center items-center gap-4 mt-4">
                  <div className="w-1/2">
                    <FormField
                      control={form.control}
                      name="MFS"
                      render={() => (
                        <FormItem>
                          <FormLabel>MFS</FormLabel>
                          <Select
                            onValueChange={(value) =>
                              dispatch(setMfsName(value))
                            }
                            defaultValue={tsData.paidAmount.mfs.name}
                          >
                            <FormControl>
                              <SelectTrigger className="">
                                <SelectValue placeholder="Bkash" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Bkash">Bkash</SelectItem>
                              <SelectItem value="Nagad">Nagad</SelectItem>
                              <SelectItem value="Upay">Upay</SelectItem>
                              <SelectItem value="Rocket">Rocket</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="w-1/2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel>MFS Number</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="MFS Number"
                              onChange={(e) =>
                                dispatch(setMfsNumber(e.target.value))
                              }
                              value={tsData.paidAmount.mfs.phone}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* BANK */}
              {tsData.paymentMethodType === "Bank" && (
                <div className="flex justify-center items-center gap-4 mt-4">
                  <div className="w-1/2">
                    <FormField
                      control={form.control}
                      name="Bank"
                      render={() => (
                        <FormItem className="w-full">
                          <FormLabel>Bank</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Bank Name"
                              onChange={(e) =>
                                dispatch(setBankName(e.target.value))
                              }
                              value={tsData.paidAmount.bank.name}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="w-1/2">
                    <FormField
                      control={form.control}
                      name="Account No"
                      render={() => (
                        <FormItem className="w-full">
                          <FormLabel>Account No</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Account No"
                              onChange={(e) =>
                                dispatch(setAccountNo(e.target.value))
                              }
                              value={tsData.paidAmount.bank.accountNo}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* cheque */}
              {tsData.paymentMethodType === "Cheque" && (
                <div className="flex justify-center items-center gap-4 mt-4">
                  <div className="w-1/2">
                    <FormField
                      control={form.control}
                      name="Cheque"
                      render={() => (
                        <FormItem className="w-full">
                          <FormLabel>Bank Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Cheque Name"
                              onChange={(e) =>
                                dispatch(setChequeName(e.target.value))
                              }
                              value={tsData.paidAmount.cheque.name}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="w-1/2">
                    <FormField
                      control={form.control}
                      name="name"
                      render={() => (
                        <FormItem className="w-full">
                          <FormLabel>Cheque No</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Cheque No"
                              onChange={(e) =>
                                dispatch(setChequeNo(e.target.value))
                              }
                              value={tsData.paidAmount.cheque.checqueNo}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Card */}
              {tsData.paymentMethodType === "Card" && (
                <div className="flex justify-center items-center gap-4 mt-4">
                  <div className="w-1/2">
                    <FormField
                      control={form.control}
                      name="Card"
                      render={() => (
                        <FormItem>
                          <FormLabel>Card</FormLabel>
                          <Select
                            onValueChange={(value) =>
                              dispatch(setCardName(value))
                            }
                            defaultValue={tsData.paidAmount.card.name}
                          >
                            <FormControl>
                              <SelectTrigger className="">
                                <SelectValue placeholder="Bkash" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Bkash">Bkash</SelectItem>
                              <SelectItem value="Nagad">Nagad</SelectItem>
                              <SelectItem value="Upay">Upay</SelectItem>
                              <SelectItem value="Rocket">Rocket</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="w-1/2">
                    <FormField
                      control={form.control}
                      name="Card No"
                      render={() => (
                        <FormItem className="w-full">
                          <FormLabel>Card No</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Card No"
                              onChange={(e) =>
                                dispatch(setCardNo(e.target.value))
                              }
                              value={tsData.paidAmount.card.accountNo}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              <p className="mt-2 text-sm">Note</p>
              <Textarea
                className="w-full"
                onChange={(e) => dispatch(setNote(e.target.value))}
              />
            </div>

            <Button type="submit">Submit</Button>
          </form>
        </Form>

        <Toaster />
      </div>
      <Loader isOpen={loader} onClose={setLoader} title="Please Wait" />
    </div>
  );
}

export default CollectionForm;
