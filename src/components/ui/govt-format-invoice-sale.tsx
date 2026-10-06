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
import { format } from "date-fns";


export function TaxInvoicePrint({
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
  const [orderData, setOrderData] = useState<any>();
  const productsInfo = orderData?.products;

  useEffect(() => {
    const getSaleData = async () => {
      if (product?.id) {
        const data = await salesById(product.id);
        setOrderData(data);
      }
    };
    getSaleData();
  }, [product?.id]);
  //  ("orderData", orderData);
  //  ("convert to word", convertToWords(product.total));
  //  ("govt", orderData);

  return (
    <div>
      <style jsx global>{`
        @media print {
          .print-container {
            width: 100%;
            {/* page-break-inside: avoid; */}
          }

          .print-header {
            top: 0;
            width: 95%;
            background-color: white;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            page-break-inside: auto;
          }

          thead {
            display: table-header-group; /* Ensure header is repeated on each page */
          }

          tfoot {
            display: table-footer-group; /* Ensure footer is repeated on each page */
          }

          tbody {
            display: table-row-group;
          }

          tr {
            page-break-inside: avoid; /* Avoid breaking rows across pages */
          }

          th,
          td {
            margin-top: 80px;
            border: 1px solid #ddd;
          }
          .print-body {
            page-break-inside: auto;
          }
          {/* .content {
            position: relative;
            display: block;
            width: 95%;

            /* Adjust according to the header height */
          } */}
          .content:after{
            margin-top:100px;
          }
          body {
            -webkit-print-color-adjust: exact;
            page-break-inside: avoid;
          }
          .printable::after {
    content: '';
    display: block;
    page-break-before: always;
    margin-top: 70px; /* Adjust to header height */
  }

  .printable:last-child::after {
    content: none;
  }
          @page {
            margin-bottom: 50px;
          }
        }
      `}</style>

      <AlertDialog open={open} className="print-container printable">
        <AlertDialogContent className="max-w-[900px] min-w-[200px] print-body ">
          <AlertDialogHeader>
            {/* <AlertDialogTitle className="mb-2">Create New Order</AlertDialogTitle> */}
            <AlertDialogDescription>
              {/* @ts-ignore */}

              <div className="overflow-y-auto max-h-[80vh]">
                <Card
                  className=" rounded-none min-h-[840px] max-h-[3508px] text-xs"
                  ref={componentRef}
                >
                  <CardHeader>
                    <CardTitle className="print-header">
                      <div className="flex justify-between">
                        <div>
                          <img
                            className="w-[80px]"
                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Government_Seal_of_Bangladesh.svg/750px-Government_Seal_of_Bangladesh.svg.png"
                            alt=""
                          />
                        </div>
                        <div>
                          <p className="text-center font-bold font-base ">
                            "গনপ্রজাতন্ত্রী বাংলাদেশ সরকার"
                          </p>
                          <p className="text-center mt-2 font-sm font-thin">
                            জাতীয় রাজস্ব বোর্ড
                          </p>
                          <p className="text-center mt-2 font-bold font-base">
                            কর চালানপত্র
                          </p>
                        </div>
                        <div>
                          <button className="border p-2 border-2 border-black text-[10px] px-4">
                            মূসক - ৬.৩
                          </button>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-col items-start ml-10">
                        <p className=" mt-2 text-[10px] font-thin">
                          [ বিধি ৪০ এর উপ-বিধি (১) এর দফা (গ) ও দফা (চ)
                          দ্রষ্টব্য ]
                        </p>
                        <p className=" mt-2 text-[10px] font-thin">
                          নিবন্ধিত ব্যক্তির নামঃ{" "}
                          <span className="ml-2" style={{ fontWeight: "500" }}>
                            Citizen Trade Management
                          </span>
                        </p>
                        <p className=" mt-2 text-[10px] text-black font-thin">
                          নিবন্ধিত ব্যক্তির বিয়াইএনঃ
                          <span className="ml-2" style={{ fontWeight: "500" }}>
                            533104342212
                          </span>
                        </p>
                        <p className=" mt-2 text-[10px] text-black font-thin">
                          চালানপত্র ইস্যুর ঠিকানাঃ{" "}
                          <span className="ml-2" style={{ fontWeight: "500" }}>
                            Suite - 623, BNS Center, Plot - 87, Sector - 7,
                            Uttara, Dhaka-1230
                          </span>
                        </p>
                      </div>
                      <div className="flex justify-between mb-2 h-[100px] text-black mt-2 text-[10px] mb-4 text-xs">
                        <div className="w-2/3">
                          <p className=" mt-2">
                            ক্রেতার নামঃ{" "}
                            <span className="f">
                              {orderData?.customer?.name}
                            </span>
                          </p>
                          <p className=" ">
                            ক্রেতার বিয়াইএনঃ {orderData?.customer?.bin}
                          </p>
                          <p className=" ">
                            ক্রেতার ঠিকানাঃ {orderData?.customer?.address}
                          </p>
                          <p className=" ">
                            সরবরাহের গন্তব্যস্থলঃ {orderData?.deliveryAddress}
                          </p>
                          <p className=" ">
                            যানবহনের প্রকৃতি ও নম্বরঃ {orderData?.vehicleNumber}
                          </p>
                        </div>
                        <div className="w-1/3">
                          <p className=" ">
                            চালানপত্র নম্বরঃ{" "}
                            <span className=" text-[10px]">
                              {orderData?.vatCallanNumber}
                            </span>
                          </p>
                          <p className=" ">
                            ইস্যুর তারিখঃ{" "}
                            <span className="font-normal">
                              {orderData
                                ? format(
                                    new Date(orderData?.createdAt),
                                    "MM/dd/yyyy"
                                  )
                                : 0}
                            </span>
                          </p>
                          <p className=" ">ইস্যুর সময়ঃ </p>
                          <p className=" ">ডেলিভারির তারিখঃ</p>
                          <p className=" ">ডেলিভারির সময়ঃ</p>
                        </div>
                      </div>
                    </CardTitle>
                    {/* <Separator /> */}
                    <CardDescription>
                      {/* <div className="flex justify-between mb-2 h-[100px] text-black mt-2 text-[10px] mb-4 text-xs">
                        <div className="w-2/3">
                          <p className=" mt-2">
                            ক্রেতার নামঃ{" "}
                            <span className="f">
                              {orderData?.customer?.name}
                            </span>
                          </p>
                          <p className=" ">
                            ক্রেতার বিয়াইএনঃ {orderData?.customer?.bin}
                          </p>
                          <p className=" ">
                            ক্রেতার ঠিকানাঃ {orderData?.customer?.address}
                          </p>
                          <p className=" ">
                            সরবরাহের গন্তব্যস্থলঃ {orderData?.deliveryAddress}
                          </p>
                          <p className=" ">
                            যানবহনের প্রকৃতি ও নম্বরঃ {orderData?.vehicleNumber}
                          </p>
                        </div>
                        <div className="w-1/3">
                          <p className=" ">
                            চালানপত্র নম্বরঃ{" "}
                            <span className=" text-[10px]">
                              {orderData?.vatCallanNumber}
                            </span>
                          </p>
                          <p className=" ">
                            ইস্যুর তারিখঃ{" "}
                            <span className="font-normal">
                              {orderData
                                ? format(
                                    new Date(orderData?.createdAt),
                                    "MM/dd/yyyy"
                                  )
                                : 0}
                            </span>
                          </p>
                          <p className=" ">ইস্যুর সময়ঃ </p>
                          <p className=" ">ডেলিভারির তারিখঃ</p>
                          <p className=" ">ডেলিভারির সময়ঃ</p>
                        </div>
                      </div> */}
                      <div className="content ">
                        <Table>
                          <TableHeader>
                            <TableRow className="mt-4">
                              <TableHead className=" pl-0 text-black font-thin text-center text-[10px] border border-black pl-2">
                                ক্রমিক
                              </TableHead>
                              <TableHead className=" pl-0 text-black font-thin text-center text-[10px] border border-black">
                                পন্য / সেবার বর্ণ্না (প্রযোজ্য ক্ষেত্রে
                                ব্র্যান্ড নামসহ)
                              </TableHead>
                              <TableHead className="text-black font-thin text-center text-[10px] border border-black">
                                সরবরাহের একক
                              </TableHead>
                              <TableHead className="text-black font-thin text-center text-[10px] border border-black">
                                পরিমাণ
                              </TableHead>
                              <TableHead className="text-right text-black font-thin text-center text-[10px] border border-black">
                                একক মূল্য (টাকায়)
                              </TableHead>
                              <TableHead className="text-right text-black font-thin text-center text-[10px] border border-black">
                                মোট মূল্য (টাকায়)
                              </TableHead>
                              <TableHead className="text-right text-black font-thin text-center text-[10px] border border-black">
                                সম্পূরক শুল্কের হার
                              </TableHead>
                              <TableHead className="text-right text-black font-thin text-center text-[10px] border border-black">
                                সম্পূরক শুল্কের পরিমাণ (টাকায়)
                              </TableHead>
                              <TableHead className="text-right text-black font-thin text-center text-[10px] border border-black">
                                মূল্য সংযোজন করের হার / সুনির্দিষ্ট কর
                              </TableHead>
                              <TableHead className="text-right text-black font-thin text-center text-[10px] border border-black">
                                মূল্য সংযোজন কর / সুনির্দিষ্ট কর এর পরিমাণ
                                (টাকায়)
                              </TableHead>
                              <TableHead className="text-right text-black font-thin text-center text-[10px] border border-black">
                                সকল প্রকার শুল্ক ও করসহ মূল্য
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody className="border-b">
                            <TableRow>
                              <TableCell className="text-black text-[10px] border-r  py-[2px] border text-center border-black">
                                (১)
                              </TableCell>
                              <TableCell className="text-black text-[10px] border-r  py-[2px] border text-center border-black">
                                (২)
                              </TableCell>
                              <TableCell className="text-black text-[10px] border-r  py-[2px] border text-center border-black">
                                (৩)
                              </TableCell>
                              <TableCell className="text-black text-[10px] border-r  py-[2px] border text-center border-black">
                                (৪)
                              </TableCell>
                              <TableCell className="text-black text-[10px] border-r  py-[2px] border text-center border-black">
                                (৫)
                              </TableCell>
                              <TableCell className="text-black text-[10px] border-r  py-[2px] border text-center border-black">
                                (৬)
                              </TableCell>
                              <TableCell className="text-black text-[10px] border-r  py-[2px] border text-center border-black">
                                (৭)
                              </TableCell>
                              <TableCell className="text-black text-[10px] border-r  py-[2px] border text-center border-black">
                                (৮)
                              </TableCell>
                              <TableCell className="text-black text-[10px] border-r  py-[2px] border text-center border-black">
                                (৯)
                              </TableCell>
                              <TableCell className="text-black text-[10px] border-r  py-[2px] border text-center border-black">
                                (১০)
                              </TableCell>
                              <TableCell className="text-black text-[10px] border-r  py-[2px] border text-center border-black">
                                (১১)
                              </TableCell>
                            </TableRow>
                            {productsInfo?.map(
                              (product: any, index: number) => (
                                <TableRow
                                  key={product.id}
                                  className="text-[10px] text-black border-black"
                                >
                                  <TableCell className="font-medium text-[10px]  border-r border-l py-[2px] border-black">
                                    {index + 1}.
                                  </TableCell>
                                  <TableCell className="font-medium text-[10px] border-r  py-[2px] border-black">
                                    {product.name}
                                  </TableCell>
                                  <TableCell className="border-r py-[2px] border-black text-center">
                                    Pcs
                                  </TableCell>
                                  <TableCell className="border-r py-[2px] border-black text-right">
                                    {product.qty}
                                  </TableCell>
                                  <TableCell className="border-r py-[2px] border-black text-right">
                                    {product.tp
                                      ? (product.tp / 1.15).toFixed(2)
                                      : "0.00"}
                                  </TableCell>
                                  <TableCell className="text-right border-r py-[2px] border-black text-right">
                                    {product.tp
                                      ? (
                                          (product.tp / 1.15) *
                                          product.qty
                                        ).toFixed(2)
                                      : "0.00"}
                                  </TableCell>
                                  <TableCell className="text-right border-r py-[2px] border-black text-center">
                                    0.00
                                  </TableCell>
                                  <TableCell className="text-right border-r py-[2px] border-black text-center">
                                    0.00
                                  </TableCell>
                                  <TableCell className="text-right border-r py-[2px] border-black text-center">
                                    15.0
                                  </TableCell>
                                  <TableCell className="border-r py-[2px] border-black text-right">
                                    {product.tp
                                      ? (
                                          (product.tp / 1.15) *
                                          product.qty *
                                          0.15
                                        ).toFixed(2)
                                      : "0.00"}
                                  </TableCell>
                                  <TableCell className="text-right border-r py-[2px] border-black text-right">
                                    {product.tp
                                      ? (
                                          (product.tp / 1.15) *
                                            product.qty *
                                            0.15 +
                                          (product.tp / 1.15) * product.qty
                                        ).toFixed(2)
                                      : "0.00"}
                                  </TableCell>
                                </TableRow>
                              )
                            )}
                            <TableRow className="text-[10px] text-black font-base border-black  ">
                              <TableCell
                                colSpan={5}
                                className="text-right border-r py-[2px] border-black border-b border-l"
                              >
                                সর্বমোট =
                              </TableCell>
                              <TableCell className="text-right border-r py-[2px] border-black border-b border-l">
                                {productsInfo
                                  ?.reduce(
                                    (acc: number, product: any) =>
                                      acc +
                                      (product.tp
                                        ? (product.tp / 1.15) * product.qty
                                        : 0),
                                    0
                                  )
                                  .toFixed(2)}
                              </TableCell>
                              <TableCell className="text-right border-r py-[2px] border-black border-b border-l">
                                0.00
                              </TableCell>
                              <TableCell className="text-right border-r py-[2px] border-black border-b border-l">
                                0.00
                              </TableCell>
                              <TableCell className="text-right border-r py-[2px] border-black border-b border-l">
                                -
                              </TableCell>
                              <TableCell className="text-right border-r py-[2px] border-black border-b border-l">
                                {productsInfo
                                  ?.reduce(
                                    (acc: number, product: any) =>
                                      acc +
                                      (product.tp
                                        ? (product.tp / 1.15) *
                                          product.qty *
                                          0.15
                                        : 0),
                                    0
                                  )
                                  .toFixed(2)}
                              </TableCell>
                              <TableCell className="text-right font-base border-r py-[2px] border-black border-b border-l">
                                {productsInfo
                                  ?.reduce(
                                    (acc: number, product: any) =>
                                      acc +
                                      (product.tp
                                        ? (product.tp / 1.15) *
                                            product.qty *
                                            0.15 +
                                          (product.tp / 1.15) * product.qty
                                        : 0),
                                    0
                                  )
                                  .toFixed(2)}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>

                        {/* <p className="text-black mt-4">
                          <span className="font-bold">In Word:</span>{" "}
                          {convertToWords(product?.total)} Taka Only
                        </p> */}
                        {/*  */}
                      </div>

                      <div className=" bottom-0.5 w-[80%] text-xs">
                        <div className="">
                          <p className="font-thin mt-2 text-black text-[11px]">
                            <span>
                              প্রতিষ্ঠান কর্তৃপক্ষের দায়িত্বপ্রাপ্ত ব্যক্তির
                              নামঃ {product?.warehouse?.name}
                            </span>
                          </p>
                          <p className="font-thin mt-2 text-black text-[11px]">
                            পদবিঃ
                            <span> </span>
                          </p>
                          <p className="font-thin mt-2 text-black text-[11px]">
                            সাক্ষরঃ
                            <span></span>
                          </p>
                          <p className="font-thin mt-4 text-black text-[11px]">
                            সিলঃ
                            <span></span>
                          </p>
                          <p className="font-thin mt-8 text-black text-[11px]">
                            <span className="text-black">
                              <sup>১</sup>
                            </span>
                            সকল প্রকার কর ব্যতিত মূল্য
                            <span className="text-black">";</span>
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
