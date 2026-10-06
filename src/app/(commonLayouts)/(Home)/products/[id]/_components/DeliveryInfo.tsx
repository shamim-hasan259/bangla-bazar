"use client";

import React, { useState, useEffect, useRef } from "react";
import { Truck, RotateCcw, Shield, MapPin, Banknote, Printer, Copy, Check } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useReactToPrint } from "react-to-print";

interface DeliveryInfoProps {
  product?: any;
}

const DeliveryInfo = ({ product }: DeliveryInfoProps) => {
  const [mounted, setMounted] = useState(false);
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setOrigin(window.location.origin);
  }, []);

  const qrValue = origin && product?.id ? `${origin}/products/${product.id}` : "";

  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

  const handleCopyLink = async () => {
    if (!qrValue) return;
    try {
      await navigator.clipboard.writeText(qrValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3.5">
      {/* Buyer Protection & Services list */}
      <div className="space-y-3.5">
        {/* 75-Day Buyer Protection */}
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 flex items-center justify-center shrink-0 text-amber-600 dark:text-amber-400 mt-0.5">
            <Shield className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
              75-Day Buyer Protection
            </h4>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              Orders from All item.
            </p>
          </div>
        </div>

        {/* Free Return */}
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-orange-50 dark:bg-orange-950/40 border border-orange-200/80 dark:border-orange-800/60 flex items-center justify-center shrink-0 text-orange-600 dark:text-orange-400 mt-0.5">
            <RotateCcw className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
              Free Return
            </h4>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              Pay with Multiple Cards
            </p>
          </div>
        </div>

        {/* Delivery Timeline */}
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400 mt-0.5">
            <Truck className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
              Delivery Within 3-5 Working Days
            </h4>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              Cash on Delivery & Instant Tracking
            </p>
          </div>
        </div>
      </div>

      {/* QR Code & Print Options */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span>Dhaka, Bangladesh</span>
        </div>

          {/* Small QR Code Thumbnail trigger */}
          {product && mounted && qrValue && (
            <Dialog>
              <DialogTrigger asChild>
                <button
                  title="View Product QR Code"
                  className="flex items-center justify-center p-1 border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-sm group hover:scale-105 active:scale-95"
                >
                  <QRCodeSVG value={qrValue} size={24} level="M" />
                  <span className="sr-only">Product QR Code</span>
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[400px] p-6 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-lg">
                <style>{`
                  @media print {
                    @page {
                      size: 75mm 90mm;
                      margin: 0;
                    }
                    body {
                      -webkit-print-color-adjust: exact;
                      background: white;
                    }
                    .print-container {
                      display: block !important;
                      position: absolute;
                      left: 0;
                      top: 0;
                      width: 75mm;
                      height: 90mm;
                      padding: 5mm;
                      background: white !important;
                      color: black !important;
                    }
                  }
                `}</style>
                <DialogHeader className="flex flex-col items-center text-center">
                  <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
                    Product QR Code
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[280px]">
                    Scan this QR code to view this product on your phone or search it on Bangla Bazar
                  </DialogDescription>
                </DialogHeader>

                {/* QR Display Container to Print */}
                <div className="flex flex-col items-center justify-center my-4 py-4 bg-slate-50 dark:bg-slate-950 rounded-lg border border-dashed border-slate-300 dark:border-slate-800 relative">
                  <div
                    ref={printRef}
                    className="print-container bg-white shadow-md flex flex-col items-center justify-between p-4 border border-slate-250 text-slate-900 rounded"
                    style={{ width: "75mm", height: "90mm" }}
                  >
                    <div className="w-full text-center border-b border-slate-100 pb-1.5 mb-2 flex flex-col items-center">
                      <span className="text-[10px] uppercase tracking-widest font-black text-orange-600">
                        Bangla Bazar
                      </span>
                    </div>
                    
                    <div className="text-center w-full mb-2">
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-2 uppercase px-1">
                        {product.name}
                      </h4>
                      {product.model && (
                        <p className="text-[8px] text-slate-500 mt-0.5">
                          Model: {product.model}
                        </p>
                      )}
                    </div>

                    <div className="p-2 bg-white rounded border border-slate-150 flex items-center justify-center">
                      <QRCodeSVG value={qrValue} size={120} level="H" />
                    </div>

                    <div className="w-full text-center mt-2 pt-2 border-t border-slate-100 flex flex-col items-center">
                      <span className="text-[8px] text-slate-400 uppercase font-medium">Price</span>
                      <div className="text-sm font-black text-slate-900">
                        ৳{product.promoPrice && product.promoPrice > 0 ? product.promoPrice : product.price}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-2">
                  <Button
                    onClick={handleCopyLink}
                    variant="outline"
                    className="flex-1 flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs py-2 h-9 transition-colors active:scale-95"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-500" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handlePrint}
                    className="flex-1 bg-[#f85606] hover:bg-[#d84a05] text-white flex items-center justify-center gap-2 text-xs py-2 h-9 shadow transition-colors active:scale-95 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print QR</span>
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
  );
};

export default DeliveryInfo;
