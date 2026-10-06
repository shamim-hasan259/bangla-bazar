"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Edit, ImageIcon } from "lucide-react";
import BusinessInfoUpdateForm from "./BusinessInfoUpdateForm";

const BusinessInfoSetting = () => {
  return (
    <div className="border shadow-lg p-6 rounded-lg space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Business Information</h2>

        <Dialog>
          <DialogTrigger>
            <Button variant="outline">
              Modify
              <Edit size="icon" className="ml-2" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Business Information</DialogTitle>
              <BusinessInfoUpdateForm />
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>

      <div>
        <label>Seller Type</label>
        <p className="text-gray-500 dark:text-gray-200">Corporate</p>
      </div>
      <div>
        <label>Business Name</label>
        <p className="text-gray-500 dark:text-gray-200">Mamaearth Bangladesh</p>
      </div>
      <div>
        <label>Business Registration Number</label>
        <p className="text-gray-500 dark:text-gray-200">{"TR0ADN996985678"}</p>
      </div>
      <div>
        <label>Address</label>
        <p className="text-gray-500 dark:text-gray-200">
          {"House: 06, Road: 27, Uttara Sector-07, Dhaka-1230"}
        </p>
      </div>
      <div>
        <label>City / Town</label>
        <p className="text-gray-500 dark:text-gray-200">{"N/A"}</p>
      </div>
      <div>
        <label>Country</label>
        <p className="text-gray-500 dark:text-gray-200">{"Bangladesh"}</p>
      </div>
      <div>
        <label>Business Document</label>
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

export default BusinessInfoSetting;
