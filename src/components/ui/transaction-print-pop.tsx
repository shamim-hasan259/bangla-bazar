"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./alert-dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ReactToPrint from "react-to-print";
import { AspectRatio } from "./aspect-ratio";
import { Button } from "./button";
import { Printer } from "lucide-react";
import { Toaster } from "./toaster";
import { ScrollArea } from "@/components/ui/scroll-area";

import Barcode from "react-barcode";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { useSelector } from "react-redux";
import { RootState } from "@/app/redux-store/store";
import { parseISO, format } from "date-fns";
import { } from "path";
import { salesById } from "@/app/dashboard/admin/sales/_action";
import Logo from "../common/Logo";


export function TransactionPrint({
  entry,
  open,
  setOpen,
}: {
  entry: any;
  open: boolean;
  setOpen: any;
}) {
  const product = entry;
  const componentRef = useRef<HTMLDivElement>(null);
  const handleCloseDialog = () => {
    setOpen(false);
  };
  const productsInfo = product?.products;
  //  (productsInfo);

  function convertToWords(number: number): string {
    const ones: string[] = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
    ];
    const teens: string[] = [
      "",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const tens: string[] = [
      "",
      "Ten",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];
    const thousands: string[] = [
      "",
      "Thousand",
      "Million",
      "Billion",
      "Trillion",
    ];

    if (number === 0) {
      return "Zero";
    }

    let numStr: string = "";
    let count: number = 0;

    while (number > 0) {
      if (number % 1000 !== 0) {
        numStr =
          convertThreeDigitsToWords(number % 1000) +
          " " +
          thousands[count] +
          " " +
          numStr;
      }
      number = Math.floor(number / 1000);
      count++;
    }

    return numStr.trim();
  }

  function convertThreeDigitsToWords(num: number): string {
    const ones: string[] = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
    ];
    const teens: string[] = [
      "",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const tens: string[] = [
      "",
      "Ten",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    let numStr: string = "";

    if (num >= 100) {
      numStr += ones[Math.floor(num / 100)] + " Hundred ";
      num %= 100;
    }

    if (num >= 11 && num <= 19) {
      numStr += teens[num - 10] + " ";
    } else if (num === 10 || num >= 20) {
      numStr += tens[Math.floor(num / 10)] + " ";
      num %= 10;
    }

    if (num >= 1 && num <= 9) {
      numStr += ones[num] + " ";
    }

    return numStr.trim();
  }
  const [orderData, setOrderData] = useState();

  useEffect(() => {
    const getSaleData = async () => {
      const data = await salesById(product?.id);

      setOrderData(data);
      // Log salesData to the browser console
    };
    getSaleData();
  }, [entry]);
  orderData;
  //  ("convert to word", convertToWords(product.total));
  const totalQuantity =
    productsInfo?.reduce((acc, product) => acc + product.qty, 0) || 0;

  const discount = (orderData?.discount / orderData?.currentDueAmount) * 100;

  "transactionInvoice", entry;

  // Parse the ISO date string
  const parsedDate = parseISO(entry?.date);

  // Format the date and time separately
  const formattedDate = format(parsedDate, "yyyy-MM-dd");
  const formattedTime = format(parsedDate, "HH:mm:ss");

  "sell-print-pop", formattedDate;

  return (
    <div>
      <style jsx global>{`
        @media print {
          @page {
            size: A4; /* Set the page size to A4 */
            margin: 0; /* Remove default margins */
            margin-top: 20px;
          }
          .rounded-none {
            box-shadow: none !important;
            border: none !important;
          }
          body {
            -webkit-print-color-adjust: exact;
          }
          .print-card {
            width: 210mm;
            height: 297mm;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 5mm;
            font-size: 12px; /* Adjust font size as needed */
          }
        }
      `}</style>

      <AlertDialog open={open}>
        <AlertDialogContent className="max-w-[900px] min-w-[200px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="sr-only">Transaction Invoice Print</AlertDialogTitle>
            <AlertDialogDescription>
              {/* @ts-ignore */}

              <div className="overflow-y-auto max-h-[80vh]">
                <Card
                  className=" rounded-none min-h-[840px] max-h-[3508px] relative"
                  ref={componentRef}
                >
                  <CardHeader>
                    <CardTitle className="">
                      <div className="flex mb-4 justify-between">
                        <Logo />

                        <div className="text-right text-sm">
                          <h1 className=" font-sm font-normal">
                            <span className="font-bold font-sm">Hotline:</span>{" "}
                            01332553955
                          </h1>
                          <p className="font-normal">
                            H#6, R#27, Sector 7, Uttara, Dhaka - 1230
                          </p>
                          <p className="font-normal ">
                            citizentrademanagement@gmail.com
                          </p>
                        </div>
                      </div>
                    </CardTitle>
                    <Separator />
                    <CardDescription>
                      <div className="flex justify-between  mb-2 h-[120px]">
                        <div className="text-black mr-2">
                          <h1 className="font-bold ">From</h1>
                          <h2>{entry?.name}</h2>
                          {/* <h2>{orderData?.customer?.email}</h2>
                          <h2>{orderData?.customer?.phone}</h2>
                          <h2>{orderData?.customer?.address}</h2> */}
                        </div>
                        <div className="text-black">
                          <h1 className="font-bold">To</h1>
                          <h2>{orderData?.warehouse?.name}</h2>
                          <h2>{orderData?.warehouse?.email}</h2>
                          <h2>{orderData?.warehouse?.phone}</h2>
                        </div>
                        <div className=" flex flex-col items-start text-black ">
                          <h1 className=" font-bold  ">Transaction Details</h1>
                          <h2 className="font-bold text-sm">
                            Transaction ID:{" "}
                            <span className="font-normal">
                              {entry?.transactionId}
                            </span>
                          </h2>
                          {/* <h2 className="font-bold text-sm">
                            PO No:{" "}
                            <span className="font-normal">
                              {product?.poNoId}
                            </span>
                          </h2> */}
                          {/* <h2 className="font-bold">
                        PO Date: <span className="font-normal"></span>
                      </h2> */}
                          <h2 className="font-bold">
                            Status:{" "}
                            <span className="font-normal">
                              {product?.status}
                            </span>
                          </h2>
                          {/* @ts-ignore */}
                          {/* <Barcode
                            className="text-center"
                            value={product?.grnNo}
                            height="25"
                            width="1"
                            fontSize="10"
                          /> */}
                          <h2 className="font-bold w-[240px]">
                            Delivery Address:{" "}
                            <span className="font-normal">
                              {orderData?.deliveryAddresss
                                ? orderData?.deliveryAddresss
                                : orderData?.customer?.address}
                            </span>
                          </h2>
                        </div>
                      </div>
                      <div>
                        <div>
                          <p className="text-black mt-4 py-2">
                            <span className="font-bold">Payment Date:</span>{" "}
                            {formattedDate}
                          </p>
                          <p className="text-black mt-4 py-2">
                            <span className="font-bold">Payment Time:</span>{" "}
                            {formattedTime}
                          </p>
                          <p className="text-black mt-4 py-2">
                            <span className="font-bold">Payment Method:</span>{" "}
                            {entry?.paymentMethodType}
                          </p>
                          <p className="text-black mt-4 py-2">
                            <span className="font-bold">Paid Amount:</span>{" "}
                            {entry?.amount}
                          </p>
                          <p className="text-black mt-4">
                            <span className="font-bold">In Word:</span>{" "}
                            {convertToWords(entry?.amount)} Taka Only
                          </p>

                          <p className="text-black mt-4 py-2">
                            <span className="font-bold">Reciever:</span>{" "}
                            {entry?.name}
                          </p>
                          <p className="text-black mt-4 py-2">
                            <span className="font-bold">Note:</span>{" "}
                            {entry?.note}
                          </p>
                        </div>

                        {/* 
                        <p className="text-black"><span className=" font-bold">Payment Method:</span> Cash on Delivery</p> */}

                        {/*  */}
                      </div>

                      <div className=" absolute bottom-0.5 w-[80%]">
                        <div className="flex justify-between w-full">
                          <p className="font-bold">
                            <span>Prepared By: {orderData?.user?.name}</span>
                          </p>
                          <p className="font-bold">
                            <span>Checked By:</span>
                          </p>
                          <p className="font-bold">
                            <span>Authorized By:</span>
                          </p>
                        </div>
                      </div>
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button onClick={() => handleCloseDialog()} variant="outline">
              Cancel
            </Button>
            <ReactToPrint
              trigger={() => (
                <AlertDialogAction>
                  <Printer size="18" /> Print
                </AlertDialogAction>
              )}
              content={() => componentRef.current} // Pass a function that returns the content
            />
          </AlertDialogFooter>
        </AlertDialogContent>
        <Toaster />
      </AlertDialog>
    </div>
  );
}
