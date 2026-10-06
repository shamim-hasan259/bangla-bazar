"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";
import { Loader2, TrendingUp, CheckCircle, Smartphone, Lock, Mail, User, Wallet, ArrowRight } from "lucide-react";
import { signIn } from "next-auth/react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import PasswordShowClose from "@/app/dashboard/seller/setting/_components/PasswordShowClose";

const AffiliateRegistrationSchema = z.object({
  name: z.string().min(2, { message: "Full Name is required" }),
  phone: z.string().min(11, { message: "Enter a valid phone number (min 11 digits)" }),
  email: z.string().email({ message: "Enter a valid email address" }).optional().or(z.literal("")),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string().min(1, { message: "Confirm password is required" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function AffiliateRegistrationForm() {
  const [eyeOpen, setEyeOpen] = useState(false);
  const [confirmEyeOpen, setConfirmEyeOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof AffiliateRegistrationSchema>>({
    resolver: zodResolver(AffiliateRegistrationSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: z.infer<typeof AffiliateRegistrationSchema>) {
    try {
      setIsLoading(true);

      const trimmedPhone = data.phone.trim();
      const res = await axios.post("/api/affiliate", {
        name: data.name.trim(),
        phone: trimmedPhone,
        email: data.email ? data.email.trim() : null,
        password: data.password,
      });

      toast.success("Affiliate account created successfully!");

      // Auto login
      const loginRes = await signIn("affiliateCredentials", {
        phone: trimmedPhone,
        password: data.password,
        redirect: false,
      });

      if (loginRes?.error || !loginRes?.ok) {
        toast.info("Account created! Please login with your credentials.");
        window.location.href = "/auth/affiliate/login";
      } else {
        toast.success("Welcome to Bangla Bazar Affiliate! Redirecting to dashboard...");
        window.location.href = "/dashboard/affiliate";
      }
    } catch (error: any) {
      console.error("Affiliate registration error:", error);
      const serverMsg = error?.response?.data?.message || "Registration failed. Please try again.";
      toast.error(serverMsg);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#1E60ED] mb-3">
          <TrendingUp className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Join Affiliate Program
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
          Start earning up to 10% commission on every order referred to Bangla Bazar
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Full Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-600" /> Full Name
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Mahfuzur Rahman"
                    {...field}
                    className="h-11 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700"
                  />
                </FormControl>
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />

          {/* Phone Number & Email Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-blue-600" /> Phone Number (Login ID)
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="017XXXXXXXX"
                      {...field}
                      className="h-11 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700"
                    />
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-blue-600" /> Email (Optional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@domain.com"
                      {...field}
                      className="h-11 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700"
                    />
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />
          </div>

          {/* Passwords Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-blue-600" /> Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={eyeOpen ? "text" : "password"}
                        placeholder="••••••••"
                        {...field}
                        className="h-11 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 pr-10"
                      />
                      <PasswordShowClose eyeOpen={eyeOpen} setEyeOpen={setEyeOpen} />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-blue-600" /> Confirm Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={confirmEyeOpen ? "text" : "password"}
                        placeholder="••••••••"
                        {...field}
                        className="h-11 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 pr-10"
                      />
                      <PasswordShowClose eyeOpen={confirmEyeOpen} setEyeOpen={setConfirmEyeOpen} />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-[#1E60ED] hover:bg-blue-700 text-white font-extrabold rounded-xl text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Creating Affiliate Account...
                </>
              ) : (
                <>
                  Complete Registration <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>

      <div className="text-center mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
        Already have an affiliate partner account?{" "}
        <Link
          href="/auth/affiliate/login"
          className="font-bold text-[#1E60ED] hover:underline"
        >
          Login here
        </Link>
      </div>
    </div>
  );
}
