"use client";

import React from "react";
import Image from "next/image";
import { AlertDialog, AlertDialogContent, AlertDialogTitle } from "./alert-dialog";

interface LoaderProps {
  isOpen: boolean;
  onClose: any;
  title: string;
}

const Loader: React.FC<LoaderProps> = ({ isOpen, onClose, title }) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <div className="flex flex-col justify-center items-center py-6 gap-4 select-none">
          <AlertDialogTitle className="sr-only">{title}</AlertDialogTitle>
          <div className="relative flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28">
            {/* 360 Degree Rotating Loading Ring */}
            <div className="absolute inset-0 rounded-full border-[3px] border-slate-100 dark:border-slate-800 border-t-[#36d7b7] border-r-[#36d7b7] animate-spin" />

            {/* Bag Logo */}
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 animate-pulse">
              <Image
                src="/loading-logo.png"
                alt="Bangla Bazar"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
          {title && <p className="text-sm font-medium text-slate-500 text-center">{title}</p>}
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default Loader;
