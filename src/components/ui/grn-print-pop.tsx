"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
} from "./alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ReactToPrint from "react-to-print";
import { Button } from "./button";
import { Printer } from "lucide-react";
import { Toaster } from "./toaster";
import Barcode from "react-barcode";
import { Card, CardDescription, CardHeader, CardTitle } from "./card";
import { useRef } from "react";
import { Separator } from "@/components/ui/separator";
import Logo from "../common/Logo";

export function GrnPrintLog({
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

  "convert to word", convertToWords(product.total);

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
            padding: 10mm;
            font-size: 12px; /* Adjust font size as needed */
          }
        }
      `}</style>

      <AlertDialog open={open}>
        <AlertDialogContent className="max-w-[800px] min-w-[200px]">
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
                      <div className="flex justify-between mb-2 ">
                        <div className="text-black">
                          <h1 className="font-bold ">Name of Supplier</h1>
                          <h2>{product?.supplier?.name}</h2>
                          <h2>{product?.supplier?.phone}</h2>
                          <h2>{product?.supplier?.email}</h2>
                        </div>
                        <div className="text-black">
                          <h1 className="font-bold">Warehouse</h1>
                          <h2>{product?.user?.name}</h2>
                          <h2>demo@gmail.com</h2>
                          <h2>1316842636</h2>
                        </div>
                        <div className=" flex flex-col items-end text-black">
                          <h1 className=" font-bold  ">Good Recieve Note</h1>
                          <h2 className="font-bold text-sm">
                            GRN No:{" "}
                            <span className="font-normal">
                              {product?.grnNo}
                            </span>
                          </h2>
                          <h2 className="font-bold text-sm">
                            PO No:{" "}
                            <span className="font-normal">
                              {product?.poNo?.poNo}
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
                          <Barcode
                            className="text-center"
                            value={product?.grnNo}
                            height="25"
                            width="1"
                            fontSize="10"
                          />
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
                                TP
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
                                    {product.tp ? product.tp : "0"}
                                  </TableCell>
                                  <TableCell className="text-right border-r py-[2px]">
                                    {product.mrp}
                                  </TableCell>
                                </TableRow>
                              )
                            )}
                          </TableBody>
                        </Table>
                        <div className="w-full flex  justify-end mt-2 text-black font-bold">
                          <div className="flex">
                            <p className="mr-2">Total:</p>
                            <p className="mr-4">{product.total}</p>
                          </div>
                          <div className="flex">
                            <p className="">Gross Total:</p>
                            <p className="">{product.grossTotal}</p>
                          </div>
                        </div>
                        <p className="text-black mt-4">
                          <span className="font-bold">In Word:</span>{" "}
                          {convertToWords(product.total)} Taka Only
                        </p>
                        {/*  */}
                      </div>

                      <div className=" absolute bottom-0.5 w-[80%]">
                        <div className="flex justify-between w-full">
                          <p className="font-bold">
                            <span>Prepared By:</span>
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
