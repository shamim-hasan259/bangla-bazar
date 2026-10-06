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
import { useReactToPrint } from "react-to-print";
import { AspectRatio } from "./aspect-ratio";
import { Button } from "./button";
import { Printer } from "lucide-react";
import { Toaster } from "./toaster";
import Barcode from "react-barcode";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";
import { useRef } from "react";

export function BarCodeAlertDialog({
  entry,
  open,
  setOpen,
}: {
  entry: any;
  open: boolean;
  setOpen: any;
}) {
  const product = entry;
  // const componentRef = useRef();
  const handleCloseDialog = () => {
    setOpen(false);
  };
  const componentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });
  //  (product);

  // Output: One Hundred

  return (
    <>
      <style jsx global>{`
        @media print {
          @page {
            size: 80mm 100mm; /* Custom size: 80mm width and 100mm height */
            margin: 0; /* Remove default margins */
          }
          body {
            -webkit-print-color-adjust: exact;
          }
          .print-card {
            width: 80mm;
            height: 100mm;
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
        <AlertDialogContent className="w-full max-w-md p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-center mb-2">
              Barcode Label Preview
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="flex flex-col items-center justify-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                {/* Physical Label Simulation */}
                <div 
                  ref={componentRef}
                  className="print-card bg-white shadow-xl flex flex-col items-center justify-between p-6 border border-slate-200"
                  style={{ width: '80mm', height: '100mm', minHeight: '100mm' }}
                >
                  {/* Label Header */}
                  <div className="w-full text-center border-b border-slate-100 pb-2 mb-4">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
                      Bangla Bazar Original
                    </span>
                  </div>

                  {/* Main Product Info */}
                  <div className="flex-1 flex flex-col items-center justify-center w-full gap-4">
                    <div className="text-center">
                      <h3 className="text-sm font-bold text-slate-900 leading-tight uppercase line-clamp-2 px-2">
                        {product?.name}
                      </h3>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Ref: {product?.articleCode}
                      </p>
                    </div>

                    <div className="bg-white p-2 rounded-sm border border-slate-50">
                      <Barcode
                        value={product.articleCode || "000000"}
                        height={60}
                        width={1.8}
                        fontSize={12}
                        background="transparent"
                      />
                    </div>
                  </div>

                  {/* Price Tag Section */}
                  <div className="w-full mt-4 pt-4 border-t border-slate-100 flex flex-col items-center">
                    <span className="text-[10px] text-slate-400 uppercase font-medium">Retail Price</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-slate-900">{product?.mrp}</span>
                      <span className="text-sm font-bold text-slate-900">TK</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-[11px] text-slate-400 mt-6 animate-pulse">
                  Rendering 80mm x 100mm standard label
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <Button 
              onClick={() => handleCloseDialog()} 
              variant="ghost"
              className="hover:bg-slate-100 transition-colors"
            >
              Close
            </Button>
            <AlertDialogAction 
              onClick={() => handlePrint()}
              className="bg-slate-900 hover:bg-slate-800 text-white flex gap-2 shadow-lg hover:shadow-xl transition-all active:scale-95"
            >
              <Printer size="18" /> 
              <span>Print Label</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
        <Toaster />
      </AlertDialog>
    </>
  );
}
