"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ImageIcon, UploadCloud } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { StoreSetupFormSchema } from "./StoreSetupFormSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Image from "next/image";
import axios from "axios";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Loader from "@/components/ui/Loader";
import { uploadImages } from "../_action";

interface ISeller {
  sellerId: string;
}

const StoreSetupForm = ({
  seller,
  storeInformation,
}: {
  seller: ISeller | null;
  storeInformation: any;
}) => {
  const [storeLogoImg, setStoreLogoImg] = useState<File | null>(null);
  const [storeBannerImg, setStoreBannerImg] = useState<File | null>(null);
  const [loader, setLoader] = useState(false);
  const loaderClose = () => setLoader(false);
  const loaderShow = () => setLoader(true);

  const router = useRouter();

  const sellerId = seller?.sellerId;

  const {
    storeName,
    description,
    email,
    phone,
    storeLogo,
    storeBanner,
    address,
    facebook,
    instagram,
    x,
  } = storeInformation || {};

  const form = useForm<z.infer<typeof StoreSetupFormSchema>>({
    resolver: zodResolver(StoreSetupFormSchema),
    defaultValues: {
      storeName: storeName || "",
      description: description || "",
      phone: phone || "",
      email: email || "",
      address: address || "",
      facebook: facebook || "",
      instagram: instagram || "",
      x: x || "",
    },
  });

  const handleStoreSetupSubmit = async (
    formData: z.infer<typeof StoreSetupFormSchema>
  ) => {
    try {
      loaderShow();

      const uploadFormData = new FormData();
      if (storeLogoImg) uploadFormData.append("files", storeLogoImg);
      if (storeBannerImg) uploadFormData.append("files", storeBannerImg);

      console.log({ uploadFormData });

      // upload logo  and banner on local public folder
      const uploadResponse = await uploadImages(uploadFormData, "");

      if (uploadResponse.data.success) {
        // loaderClose();
        console.log("Uploaded URLs:", uploadResponse.data.urls);
      } else {
        loaderClose();
        toast.error("Image upload failed");
      }

      const uploadedStoreLogo = uploadResponse.data.urls[0];
      const uploadedStoreBanner = uploadResponse.data.urls[1];
      // console.log(uploadedStoreLogo, uploadedStoreBanner);

      const res = await axios.post("/api/store", {
        ...formData,
        sellerId,
        uploadedStoreLogo,
        uploadedStoreBanner,
      });

      // console.log({ res });

      if (res.status === 409) {
        loaderClose();
        toast.error("Store already exists for this seller");
      } else if (res.status === 200) {
        loaderClose();
        toast.success("Store setup successful");
        router.refresh();
        router.push("/dashboard/seller");
      }
    } catch (error: any) {
      loaderClose();
      toast.error(error.message);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleStoreSetupSubmit)}
        className="w-full rounded-lg space-y-6 lg:grid grid-cols-2 gap-x-6"
      >
        {/* _____________1. Store Information____________ */}
        <div className="border shadow-lg p-6 rounded-lg space-y-4 mt-6">
          <h2 className="text-lg font-semibold">Store Information</h2>

          {/* store name */}
          <FormField
            control={form.control}
            name="storeName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Store Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter store name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* store URL */}
          {/* <FormField
            control={form.control}
            name="storeUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Store URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://www.bmart.com.bd/store/etc"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          /> */}

          {/* store description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your store"
                    {...field}
                    className="h-24"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ___________2. Store Media______________ */}
        <div className="border shadow-lg p-6 rounded-lg space-y-4">
          <h2 className="text-lg font-semibold">Store Media</h2>

          {/* Store Logo */}
          <FormItem>
            <FormLabel>Store Logo</FormLabel>
            <FormControl>
              <div className="relative flex items-center  bg-muted rounded-lg p-4 border border-dashed border-primary-seller">
                <Input
                  name="storeLogo"
                  onChange={(e) => setStoreLogoImg(e.target.files?.[0] || null)}
                  id="storeLogo"
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                {/* Conditional logo view */}
                <div className="overflow-hidden">
                  {storeLogoImg || storeLogo ? (
                    <div>
                      {storeLogoImg && (
                        <Image
                          src={URL.createObjectURL(storeLogoImg)}
                          alt="Store Logo"
                          className="object-cover w-16 h-16 rounded-full"
                          height={100}
                          width={100}
                        />
                      )}
                      {storeLogo && !storeLogoImg && (
                        <Image
                          src={storeLogo}
                          alt="Store Logo"
                          className="object-cover w-16 h-16 rounded-full"
                          height={100}
                          width={100}
                        />
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-gray-600 pointer-events-none">
                      <UploadCloud size={32} className="text-primary-seller" />
                      <span className="mt-1 text-sm">Upload Logo</span>
                    </div>
                  )}
                </div>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>

          {/* Store Banner */}
          <FormItem>
            <FormLabel>Store Banner</FormLabel>
            <FormControl>
              <div className="relative flex items-center  bg-muted rounded-lg p-4 border border-dashed border-primary-seller">
                <Input
                  name="storeBanner"
                  onChange={(e) =>
                    setStoreBannerImg(e.target.files?.[0] || null)
                  }
                  id="storeBanner"
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                {/* Conditional banner view */}
                <div className="overflow-hidden">
                  {storeBannerImg || storeBanner ? (
                    <div>
                      {storeBannerImg && (
                        <Image
                          src={URL.createObjectURL(storeBannerImg)}
                          alt="Store Banner"
                          className="object-cover w-full h-full rounded-lg"
                          height={100}
                          width={100}
                        />
                      )}
                      {storeBanner && !storeBannerImg && (
                        <Image
                          src={storeBanner}
                          alt="Store Banner"
                          className="object-cover border border-red-800 h-36 min-w-fit rounded-lg"
                          height={100}
                          width={700}
                        />
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-gray-600 pointer-events-none">
                      <ImageIcon size={32} className="text-primary-seller" />
                      <span className="mt-1 text-sm">Upload Banner</span>
                    </div>
                  )}
                </div>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        </div>

        {/* _____________3. Contact details____________ */}
        <div className="border shadow-lg p-6 rounded-lg space-y-4">
          <h2 className="text-lg font-semibold">Contact Details</h2>

          {/* phone */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="Enter phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter email address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* address */}
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder="Enter address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/*  */}
        {/* _____________4. Social Links Section____________ */}
        <div className="border shadow-lg p-6 rounded-lg space-y-4">
          <h2 className="text-lg font-semibold">Social Links</h2>

          {/* FACEBOOK */}
          <FormField
            control={form.control}
            name="facebook"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Facebook</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://facebook.com/yourstore"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* INSTAGRAM */}
          <FormField
            control={form.control}
            name="instagram"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instagram</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://instagram.com/yourstore"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* X */}
          <FormField
            control={form.control}
            name="x"
            render={({ field }) => (
              <FormItem>
                <FormLabel>X</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://twitter.com/yourstore"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Submit Button */}
        <div className="text-end col-span-2">
          <Button type="submit" variant="seller">
            Save
          </Button>
        </div>
      </form>
      <Loader isOpen={loader} onClose={setLoader} title="Please Wait" />
    </Form>
  );
};

export default StoreSetupForm;
