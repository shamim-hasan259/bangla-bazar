import React, { useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { UpdatePasswordSchema } from "./UpdatePasswordSchema";
import PasswordShowClose from "./PasswordShowClose";

const UpdatePasswordDialog = ({ title }: { title: string }) => {
  const [eyeOpen, setEyeOpen] = useState(false);

  const form = useForm<z.infer<typeof UpdatePasswordSchema>>({
    resolver: zodResolver(UpdatePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handleVerification = async (
    data: z.infer<typeof UpdatePasswordSchema>
  ) => {
    // console.log(data);
  };

  return (
    <DialogHeader>
      <DialogTitle className={cn("mb-4")}>{title}</DialogTitle>

      <DialogDescription>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleVerification)}
            className="w-full rounded-lg space-y-6"
          >
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={`${eyeOpen ? "text" : "password"}`}
                        placeholder="Current password"
                        {...field}
                      />
                      <PasswordShowClose
                        eyeOpen={eyeOpen}
                        setEyeOpen={setEyeOpen}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={`${eyeOpen ? "text" : "password"}`}
                        placeholder="New password"
                        {...field}
                      />
                      <PasswordShowClose
                        eyeOpen={eyeOpen}
                        setEyeOpen={setEyeOpen}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={`${eyeOpen ? "text" : "password"}`}
                        placeholder="Confirm password"
                        {...field}
                      />
                      <PasswordShowClose
                        eyeOpen={eyeOpen}
                        setEyeOpen={setEyeOpen}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <div className="flex justify-end gap-2">
              <Button type="submit" variant="seller">
                Submit
              </Button>
            </div>
          </form>
        </Form>
      </DialogDescription>
    </DialogHeader>
  );
};

export default UpdatePasswordDialog;
