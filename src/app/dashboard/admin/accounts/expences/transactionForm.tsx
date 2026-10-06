"use client";

import { Input } from "@/components/ui/input";

import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
import { useRouter } from "next/navigation";

import { useEffect, useState } from "react";
import SelectMCAccountsHead from "@/components/ui/SelectMCAccountsHead";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, CheckSquare, Square } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { categoryMCDw } from "../../accounts-head/_action";
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
} from "@/app/redux-store/Slice/TransactionsSlice";
import { RootState } from "@/app/redux-store/store";
import { useSession } from "next-auth/react";
import { createTransaction } from "../_action";
import Loader from "@/components/ui/Loader";

function TransactionForm() {
  const router = useRouter();
  const [mcDW, setMcDW] = useState<any>([
    { value: "", label: "Select Master Account Head.." },
  ]);
  const [loader, setLoader] = useState(false);
  const loaderClose = () => setLoader(false);
  const loaderShow = () => setLoader(true);

  const dispatch = useDispatch();
  const { data: session } = useSession();

  const form = useForm();
  const handleMcId = (id: string) => {
    form.setValue("accountsHeadId", id);
    dispatch(setAccountHeadId(id));
  };

  const tsData = useSelector((state: RootState) => state.transactions);

  //@ts-ignore
  const sessionUserId = session?.user?.id;

  useEffect(() => {
    dispatch(setUserId(sessionUserId));
    dispatch(setUpdatedUserId(sessionUserId));
  }, [sessionUserId]);

  //  ("tsData", tsData);

  const fetchMC = async () => {
    try {
      const mcData = await categoryMCDw();
      setMcDW(mcData);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchMC();
  }, []);

  async function onSubmit(data: any) {
    try {
      loaderShow();
      const saveTransactions = await createTransaction(tsData);

      if (saveTransactions !== false) {
        if (saveTransactions) {
          toast.success("Transaction saved successfully!");
          dispatch(resetTransaction());
          router.push("/dashboard/accounts");
        } else {
          toast.error("Failed to save transaction!");
        }
      } else {
        toast.error("Failed to save transaction!");
      }
      loaderClose();
    } catch (err) {
      // "trans-error", err;
    }
  }

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-4/6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-4"
          >
            <div className="w-full flex items-center mt-4">
              <div className="w-2/3 mr-2">
                <p className="text-m mb-2">Account Head</p>
                <SelectMCAccountsHead
                  handleSelect={handleMcId}
                  selectedValue={tsData?.parentId || null}
                  data={mcDW}
                />
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
                            dispatch(setAmount(parseFloat(e.target.value)));
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

export default TransactionForm;
