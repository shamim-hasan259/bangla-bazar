"use client";

import { Button } from "@/components/ui/button";
import React from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Edit, ImageIcon } from "lucide-react";
import BusinessInfoUpdateForm from "./BusinessInfoUpdateForm";

const Finance = () => {
  return (
    <div className="border shadow-lg p-6 rounded-lg space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Bank Account</h2>

        <Dialog>
          <DialogTrigger>
            <Button variant="outline">
              Modify
              <Edit size="icon" className="ml-2" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Bank Account</DialogTitle>
              <BusinessInfoUpdateForm />
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>

      <div>
        <label>Account Title</label>
        <p className="text-gray-500 dark:text-gray-200">Mamaearth Bangladesh</p>
      </div>
      <div>
        <label>Account Number</label>
        <p className="text-gray-500 dark:text-gray-200">345678906789</p>
      </div>
      <div>
        <label>Bank Name</label>
        <p className="text-gray-500 dark:text-gray-200">
          DUTCH-BANGLA BANK LTD
        </p>
      </div>
      <div>
        <label>Branch</label>
        <p className="text-gray-500 dark:text-gray-200">UTTARA</p>
      </div>
      <div>
        <label>Routing Number</label>
        <p className="text-gray-500 dark:text-gray-200">0987654</p>
      </div>

      <div>
        <label>Upload Cheque Copy</label>
        <ImageIcon />
        {/* <Image
          src={"/public/img/offer-photo.png"}
          alt="License"
          height={100}
          width={100}
        /> */}
      </div>
    </div>
  );
};

export default Finance;
