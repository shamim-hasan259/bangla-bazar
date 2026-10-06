import React from "react";
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
import VerificationSteps from "./VerificationSteps";
import { cn } from "@/lib/utils";
import { AccountSettingFormSchema } from "./AccountSettingFormSchema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

const UpdateInfoDialogContent = ({
  title,
  contactInfo,
}: {
  title: string;
  contactInfo: any;
}) => {
  const form = useForm<z.infer<typeof AccountSettingFormSchema>>({
    resolver: zodResolver(AccountSettingFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      code: "",
    },
  });

  const titleEnd = title.split(" ");

  const handleVerification = async (
    data: z.infer<typeof AccountSettingFormSchema>
  ) => {
    console.log(data);
  };

  return (
    <DialogHeader>
      <DialogTitle className={cn("mb-4")}>{title}</DialogTitle>

      <VerificationSteps value={titleEnd[2]} />

      <DialogDescription>
        <div className="my-6 mt-20">
          <p>Your current {titleEnd[2]}</p>
          <p className="text-gray-500 dark:text-gray-200 mt-2">
            {contactInfo || "N/A"}
          </p>
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleVerification)}
            className="w-full rounded-lg space-y-6"
          >
            <div>
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verification Code in SMS</FormLabel>
                    <FormControl>
                      <div className="flex gap-2 md:w-2/3">
                        <Input placeholder="Enter the code" {...field} />
                        <Button variant="outline">Send</Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-2">
              <Button type="submit" variant="seller">
                Next
              </Button>
              <Button type="submit" variant="seller" disabled>
                Submit
              </Button>
            </div>
          </form>
        </Form>
      </DialogDescription>
    </DialogHeader>
  );
};

export default UpdateInfoDialogContent;
