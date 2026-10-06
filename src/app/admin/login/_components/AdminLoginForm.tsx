"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Lock, Mail, Eye, EyeOff, Loader2, ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";
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

const AdminLoginFormSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .transform((val) => val.trim().toLowerCase()),
  password: z
    .string()
    .min(1, "Password is required"),
});

type AdminLoginFormValues = z.infer<typeof AdminLoginFormSchema>;

export default function AdminLoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [setupSuccessMessage, setSetupSuccessMessage] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const setupParam = searchParams.get("setup");
    if (setupParam === "complete" || setupParam === "success") {
      setSetupSuccessMessage(
        "Administrator account created successfully. Please sign in below."
      );
    }
    const errorParam = searchParams.get("error");
    if (errorParam === "InactiveAccount") {
      setErrorMessage("Your Administrator account is inactive. Please contact support.");
    }
  }, [searchParams]);

  const form = useForm<AdminLoginFormValues>({
    resolver: zodResolver(AdminLoginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: AdminLoginFormValues) {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await signIn("adminCredentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (res?.error) {
        let msg = "Invalid email or password. Please verify your credentials.";
        if (res.error.toLowerCase().includes("inactive")) {
          msg = "Your Admin account is inactive. Please contact support.";
        } else if (res.error.toLowerCase().includes("too many login attempts")) {
          msg = res.error;
        }
        setErrorMessage(msg);
        toast.error("Authentication Failed", {
          description: msg,
        });
      } else if (res?.ok) {
        toast.success("Authentication successful! Redirecting to Admin Dashboard...");
        // Redirect to admin dashboard
        window.location.href = "/admin/dashboard";
      } else {
        setErrorMessage("An unexpected authentication error occurred.");
      }
    } catch (error: any) {
      console.error("Admin Login Error:", error);
      setErrorMessage("Unable to connect to authentication server. Please try again.");
      toast.error("Server Error", {
        description: "Please check your network connection and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full">
      {setupSuccessMessage && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300 animate-in fade-in duration-200">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
          <span>{setupSuccessMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300 animate-in fade-in duration-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Admin Email
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="email"
                      placeholder="admin@example.com"
                      autoComplete="email"
                      disabled={isLoading}
                      {...field}
                      className="h-11 pl-9 pr-3 rounded-xl border-slate-200 dark:border-slate-800 focus-visible:ring-blue-600 text-sm"
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-[11px] text-red-500 font-medium" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••••"
                      autoComplete="current-password"
                      disabled={isLoading}
                      {...field}
                      className="h-11 pl-9 pr-10 rounded-xl border-slate-200 dark:border-slate-800 focus-visible:ring-blue-600 text-sm"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="text-[11px] text-red-500 font-medium" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all duration-200 mt-2 cursor-pointer flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                <span>Sign In to Admin Portal</span>
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
