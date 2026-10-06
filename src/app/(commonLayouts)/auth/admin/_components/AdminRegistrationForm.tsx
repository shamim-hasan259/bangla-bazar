"use client";

import React, { useState } from "react";
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
import { toast } from "sonner";
import PageTitle from "@/components/ui/PageTitle";
import Link from "next/link";
import PasswordShowClose from "@/app/dashboard/seller/setting/_components/PasswordShowClose";
import { Loader2, ShieldCheck } from "lucide-react";
import { signIn } from "next-auth/react";

const AdminRegistrationSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    username: z
      .string()
      .min(3, { message: "Username must be at least 3 characters." })
      .regex(/^[a-zA-Z0-9_.-]+$/, { message: "Username can only contain letters, numbers, and .-_" }),
    phone: z.string().min(8, { message: "Please enter a valid phone number." }),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    password: z.string().min(6, { message: "Password must be at least 6 characters." }),
    confirmPassword: z.string().min(6, { message: "Confirm password is required." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export default function AdminRegistrationForm() {
  const [eyeOpen, setEyeOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof AdminRegistrationSchema>>({
    resolver: zodResolver(AdminRegistrationSchema),
    defaultValues: {
      name: "",
      username: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: z.infer<typeof AdminRegistrationSchema>) {
    try {
      setIsLoading(true);

      const res = await axios.post("/api/user", {
        name: data.name,
        username: data.username,
        phone: data.phone,
        email: data.email || null,
        password: data.password,
        type: "Admin",
        status: "Active",
      });

      if (res.status === 201 || res.data?.user) {
        toast.success("Admin Registration Successful! Logging you in...");

        // Attempt Auto-login
        const signInResult = await signIn("adminCredentials", {
          phone: data.username || data.phone,
          password: data.password,
          redirect: false,
        });

        if (signInResult?.error) {
          toast.error("Registration successful! Please login with your credentials.");
          router.push("/auth/admin/login");
        } else {
          toast.success("Welcome, Administrator! Redirecting...");
          router.push("/dashboard/admin");
          router.refresh();
        }
      }
    } catch (error: any) {
      console.error("Admin registration error:", error);
      const serverMessage = error?.response?.data?.message || error?.message;
      toast.error(serverMessage || "Admin registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen py-12 px-4">
      <div className="max-w-md w-full space-y-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl">
        <div className="flex flex-col items-center text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-[#1E60ED] flex items-center justify-center mb-1">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <PageTitle title="Admin Registration" className="text-2xl font-bold" />
          <p className="text-xs text-slate-500">Create a new system administrator account</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3.5">
            {/* Full Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs font-semibold">Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="System Administrator" {...field} className="h-10 text-xs" />
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            {/* Username */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs font-semibold">Username</FormLabel>
                  <FormControl>
                    <Input placeholder="admin_user" {...field} className="h-10 text-xs" />
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            {/* Phone Number */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs font-semibold">Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="017XXXXXXXX" {...field} className="h-10 text-xs" />
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            {/* Email Address */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs font-semibold">Email (Optional)</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="admin@example.com" {...field} className="h-10 text-xs" />
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs font-semibold">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={eyeOpen ? "text" : "password"}
                        placeholder="••••••••"
                        {...field}
                        className="h-10 text-xs pr-10"
                      />
                      <PasswordShowClose eyeOpen={eyeOpen} setEyeOpen={setEyeOpen} />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            {/* Confirm Password */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs font-semibold">Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      type={eyeOpen ? "text" : "password"}
                      placeholder="••••••••"
                      {...field}
                      className="h-10 text-xs"
                    />
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            <Button
              className="w-full bg-[#1E60ED] hover:bg-blue-600 text-white font-bold h-10 mt-2 text-xs rounded-xl shadow-md transition-all"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Register as Administrator"
              )}
            </Button>
          </form>
        </Form>

        <p className="flex items-center justify-center text-xs text-slate-500 font-medium">
          Already have an admin account?{" "}
          <Link href="/auth/admin/login">
            <Button variant="link" className="px-1.5 text-xs font-bold text-[#1E60ED] hover:underline">
              Login here
            </Button>
          </Link>
        </p>
      </div>
    </div>
  );
}
