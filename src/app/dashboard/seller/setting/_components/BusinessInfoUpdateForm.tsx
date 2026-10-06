import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { UploadCloud } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BankAccountFormSchema } from "./BankAccountFormSchema";

const BusinessInfoUpdateForm = () => {
  const [ChequeCopy, setChequeCopy] = useState<File | null>(null);

  const form = useForm<z.infer<typeof BankAccountFormSchema>>({
    resolver: zodResolver(BankAccountFormSchema),
    defaultValues: {
      accountTitle: "",
      accountNumber: "",
      bankName: "",
      branch: "",
      routingNumber: "",
    },
  });

  const handleUpdateBankAccount = async (
    data: z.infer<typeof BankAccountFormSchema>
  ) => {
    console.log(data);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleUpdateBankAccount)}
        className="w-full rounded-lg space-y-4"
      >
        {/* Account Title */}
        <FormField
          control={form.control}
          name="accountTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Account Number */}
        <FormField
          control={form.control}
          name="accountNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Number</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Bank Name */}
        <FormField
          control={form.control}
          name="bankName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bank Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter bank name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Branch */}
        <FormField
          control={form.control}
          name="branch"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Branch</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Routing Number */}
        <FormField
          control={form.control}
          name="routingNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Routing Number</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Upload Cheque Copy */}
        <FormItem>
          <FormLabel>Upload Cheque Copy</FormLabel>
          <FormControl>
            <div className="relative flex items-center bg-muted rounded-lg p-4 border border-dashed border-primary-seller">
              <label
                htmlFor="chequeCopy"
                className="w-full cursor-pointer flex flex-col items-center text-gray-600"
              >
                <Input
                  id="chequeCopy"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setChequeCopy(e.target.files?.[0] || null)}
                  className="hidden"
                />
                {ChequeCopy ? (
                  <div>
                    <Image
                      src={URL.createObjectURL(ChequeCopy)}
                      alt="Cheque Copy"
                      className="object-cover w-16 h-16 rounded-full"
                      height={64}
                      width={64}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-gray-600 pointer-events-none">
                    <UploadCloud size={32} className="text-primary-seller" />
                    <span className="mt-1 text-sm">Upload Cheque Copy</span>
                  </div>
                )}
              </label>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>

        {/* Submit Button */}
        <Button variant="seller" className={cn("w-full")}>
          Update
        </Button>
      </form>
    </Form>
  );
};

export default BusinessInfoUpdateForm;
