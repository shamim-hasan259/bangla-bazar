"use client";

export const dynamic = "force-dynamic";

import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";

import axios from "axios";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import sendMessage from "@/lib/smsSystem";
import PageTitle from "@/components/ui/PageTitle";
import Link from "next/link";
import { RegistrationFormSchema } from "@/lib/RegistrationFormSchema";
import { useState } from "react";
import PasswordShowClose from "@/app/dashboard/seller/setting/_components/PasswordShowClose";
import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import GoogleLoginButton from "@/components/auth/GoogleLoginButton";
import FacebookLoginButton from "@/components/auth/FacebookLoginButton";

const CustomerRegistrationForm = () => {
  const [eyeOpen, setEyeOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Initialize the form with default values and validation
  const form = useForm<z.infer<typeof RegistrationFormSchema>>({
    resolver: zodResolver(RegistrationFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      password: "",
    },
  });

  // Handle form submission
  async function onSubmit(data: z.infer<typeof RegistrationFormSchema>) {
    try {
      setIsLoading(true);
      const res = await axios.post(`/api/customer`, data);

      const to = `${res.data.customer.phone}`;
      const message = `Dear ${res.data.customer.name}, Your registration for the "Bangla Bazar" successful,  your Guest ID: ${res.data.customer.customerId}`;

      sendMessage({ message, to });

      toast.success("Registration Successful! Logging you in...");

      // Auto-login after successful registration
      const signInResult = await signIn("customerCredentials", {
        phone: data.phone,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        toast.error("Registration successful but auto-login failed. Please login manually.");
        router.push("/auth/customer/login");
      } else {
        toast.success("Welcome! Redirecting to dashboard...");
        // Redirect to customer dashboard
        router.push("/dashboard/customer");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      const serverMessage = error?.response?.data?.message;
      const errorCode = error?.response?.data?.error?.code;

      if (errorCode === "P2002" || serverMessage?.toLowerCase()?.includes("already")) {
        toast.error("This phone number is already registered. Please login.");
      } else if (serverMessage) {
        toast.error(serverMessage);
      } else {
        toast.error("Registration failed. Please check your details and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <div className="max-w-md w-full space-y-2 border p-6 rounded-md shadow-lg">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <PageTitle title="Create Account" className="pb-4 text-center" />
            {/* Full Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="Phone" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={`${eyeOpen ? "text" : "password"}`}
                        placeholder="Enter your password"
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

            <br />
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Register"
              )}
            </Button>
          </form>
        </Form>
        <GoogleLoginButton />
        <FacebookLoginButton />
        <p className="flex items-center mt-4 justify-center">
          Already have an account?
          <Link href={`/auth/customer/login`}>
            <Button variant="link" className="px-2 text-md font-semibold">
              Login
            </Button>
          </Link>
        </p>
      </div>
    </div>
  );
};

export default CustomerRegistrationForm;
