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
import { salesById } from "@/app/dashboard/admin/sales/_action";
import Logo from "../common/Logo";


export function SalePrintLog({
  id,
  open,
  setOpen,
}: {
  id: string;
  open: boolean;
  setOpen: any;
}) {
  const componentRef = useRef<HTMLDivElement>(null);
  const handleCloseDialog = () => {
    setOpen(false);
  };

  //  (saleData);

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
  const [saleData, setSaleData] = useState([]);

  const productsInfo = saleData?.products;

  useEffect(() => {
    const getSaleData = async () => {
      const data = await salesById(id);
      setSaleData(data);
      // Log salesData to the browser console
    };
    getSaleData();
  }, [id]);
  // saleData;
  //  ("convert to word", convertToWords(product.total));
  // const totalQuantity =
  //   productsInfo?.reduce((acc, product) => acc + product.qty, 0) || 0;

  //   const discount = saleData?.discount / saleData?.currentDueAmount * 100;

  "sell-print-pop", saleData;

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
            {/* <AlertDialogTitle className="mb-2">Create New Order</AlertDialogTitle> */}
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
                          <h1 className="font-bold ">Customer Info</h1>
                          <h2>{saleData?.customer?.company}</h2>
                          <h2>{saleData?.customer?.email}</h2>
                          <h2>{saleData?.customer?.phone}</h2>
                          <h2>{saleData?.customer?.address}</h2>
                        </div>
                        <div className="text-black">
                          <h1 className="font-bold">Warehouse Info</h1>
                          <h2>{saleData?.warehouse?.name}</h2>
                          <h2>{saleData?.warehouse?.email}</h2>
                          <h2>{saleData?.warehouse?.phone}</h2>
                        </div>
                        <div className=" flex flex-col items-start text-black ">
                          <h1 className=" font-bold  ">Selling Details</h1>
                          <h2 className="font-bold text-sm">
                            Invoice No:{" "}
                            <span className="font-normal">
                              {saleData?.invoiceId}
                            </span>
                          </h2>
                          {/* <h2 className="font-bold text-sm">
                            PO No:{" "}
                            <span className="font-normal">
                              {saleData?.poNoId}
                            </span>
                          </h2> */}
                          {/* <h2 className="font-bold">
                        PO Date: <span className="font-normal"></span>
                      </h2> */}
                          <h2 className="font-bold">
                            Status:{" "}
                            <span className="font-normal">
                              {saleData?.status}
                            </span>
                          </h2>
                          {/* @ts-ignore */}
                          {saleData?.invoiceId ? (
                            <Barcode
                              className="text-center"
                              value={saleData.invoiceId}
                              height="25"
                              width="1"
                              fontSize="10"
                            />
                          ) : null}
                          <h2 className="font-bold w-[240px]">
                            Delivery Address:{" "}
                            <span className="font-normal">
                              {saleData?.deliveryAddresss
                                ? saleData?.deliveryAddresss
                                : saleData?.customer?.address}
                            </span>
                          </h2>
                        </div>
                      </div>
                      <div>
                        <Table>
                          <TableHeader>
                            <TableRow className="">
                              <TableHead className=" pl-0 text-black font-bold pl-2">
                                #
                              </TableHead>
                              <TableHead className=" pl-0 text-black font-bold">
                                Code
                              </TableHead>
                              <TableHead className="text-black font-bold">
                                Name
                              </TableHead>
                              <TableHead className="text-black font-bold">
                                Qty
                              </TableHead>
                              <TableHead className="text-right text-black font-bold">
                                Price
                              </TableHead>
                              <TableHead className="text-right text-black font-bold">
                                MRP
                              </TableHead>
                              <TableHead className="text-right text-black font-bold">
                                Discount
                              </TableHead>
                              <TableHead className="text-right text-black font-bold">
                                Amount
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody className="border-b">
                            {productsInfo?.map(
                              (product: any, index: number) => (
                                <TableRow
                                  key={product.id}
                                  className="text-xs text-black"
                                >
                                  <TableCell className="font-medium text-xs  border-r border-l py-[2px]">
                                    {index + 1}.
                                  </TableCell>
                                  <TableCell className="font-medium text-xs border-r  py-[2px]">
                                    {product.articleCode}
                                  </TableCell>
                                  <TableCell className="border-r py-[2px]">
                                    {product.name}
                                  </TableCell>
                                  <TableCell className="border-r py-[2px]">
                                    {product.qty}
                                  </TableCell>
                                  <TableCell className="border-r py-[2px]">
                                    {product.price ? product.price : "0"}
                                  </TableCell>
                                  <TableCell className="border-r py-[2px]">
                                    {product.mrp ? product.mrp : "0"}
                                  </TableCell>
                                  <TableCell className="border-r py-[2px] text-center">
                                    {product?.discount}
                                  </TableCell>
                                  <TableCell className="text-right border-r py-[2px]">
                                    {product?.total}
                                  </TableCell>
                                </TableRow>
                              )
                            )}
                          </TableBody>
                        </Table>
                        <div className="w-full flex  justify-end mt-2 text-black font-bold">
                          <div className="flex">
                            <p className="mr-2">Total Quantity:</p>
                            <p className="mr-4">{saleData?.totalItem}</p>
                          </div>
                          <div className="flex mr-2">
                            <p className="">Discount Amount:</p>
                            <p className="">{saleData?.discount}</p>
                          </div>
                          <div className="flex mr-2">
                            <p className="">Total:</p>
                            <p className="">{saleData?.total}</p>
                          </div>
                          <div className="flex">
                            <p className="">Grand Total:</p>
                            <p className="">{saleData?.grossTotalRound}</p>
                          </div>
                        </div>
                        <p className="text-black mt-4">
                          <span className="font-bold">In Word:</span>{" "}
                          {convertToWords(saleData?.total)} Taka Only
                        </p>
                        <p className="text-black">
                          <span className=" font-bold">Payment Method:</span>{" "}
                          Cash on Delivery
                        </p>

                        {/*  */}
                      </div>

                      <div className=" absolute bottom-0.5 w-[80%]">
                        <div className="flex justify-between w-full">
                          <p className="font-bold">
                            <span>Prepared By: {saleData?.user?.name}</span>
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
