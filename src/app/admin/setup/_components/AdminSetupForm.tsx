"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Lock,
  Mail,
  User,
  KeyRound,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Circle,
  Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import axios from "axios";

const AdminSetupSchema = z
  .object({
    name: z
      .string()
      .min(5, "Administrator full name must be at least 5 characters.")
      .max(100, "Name cannot exceed 100 characters.")
      .transform((val) => val.trim()),
    email: z
      .string()
      .min(1, "Administrator email address is required.")
      .email("Please enter a valid email address.")
      .transform((val) => val.trim().toLowerCase()),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long.")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must include at least one uppercase letter, one lowercase letter, and one number."
      ),
    confirmPassword: z.string().min(1, "Please confirm your password."),
    setupToken: z
      .string()
      .min(1, "One-Time Setup Token is required.")
      .transform((val) => val.trim()),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type AdminSetupFormValues = z.infer<typeof AdminSetupSchema>;

export default function AdminSetupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const form = useForm<AdminSetupFormValues>({
    resolver: zodResolver(AdminSetupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      setupToken: "",
    },
  });

  const passwordValue = form.watch("password") || "";

  // Password requirement criteria
  const hasMinLength = passwordValue.length >= 8;
  const hasUppercase = /[A-Z]/.test(passwordValue);
  const hasLowercase = /[a-z]/.test(passwordValue);
  const hasNumber = /\d/.test(passwordValue);

  async function onSubmit(data: AdminSetupFormValues) {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await axios.post("/api/admin/setup", {
        name: data.name,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        setupToken: data.setupToken,
      });

      if (response.status === 201 && response.data?.success) {
        setIsSuccess(true);
        toast.success("Administrator Created Successfully!", {
          description: "Setup is now permanently locked. Signing in...",
        });

        // Attempt automatic login with the new credentials
        try {
          const signInRes = await signIn("adminCredentials", {
            email: data.email,
            password: data.password,
            redirect: false,
          });

          if (signInRes?.ok) {
            window.location.href = "/admin/dashboard";
            return;
          }
        } catch (authErr) {
          console.error("Auto sign-in error:", authErr);
        }

        // Fallback: Redirect to admin login after short delay
        setTimeout(() => {
          window.location.href = "/admin/login?setup=complete";
        }, 1500);
      }
    } catch (error: any) {
      console.error("Admin setup submission error:", error);
      const serverError =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "An unexpected error occurred during setup.";
      setErrorMessage(serverError);
      toast.error("Setup Failed", {
        description: serverError,
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="py-8 text-center space-y-4 animate-in fade-in zoom-in duration-300">
        <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Admin Account Initialized!
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            The setup system is now permanently locked. Redirecting to your secure Admin Dashboard...
          </p>
        </div>
        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 pt-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Finalizing session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {errorMessage && (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200/80 bg-red-50/90 dark:border-red-900/50 dark:bg-red-950/40 p-4 text-xs font-medium text-red-800 dark:text-red-300 animate-in fade-in duration-200 shadow-sm">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
          <div className="flex-1 leading-relaxed">{errorMessage}</div>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Administrator Full Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Full Name
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="e.g. Master Administrator"
                      autoComplete="name"
                      disabled={isLoading}
                      {...field}
                      className="h-11 pl-10 pr-3 rounded-xl border-slate-200 dark:border-slate-800 focus-visible:ring-blue-600 text-sm bg-slate-50/50 dark:bg-slate-900/50"
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-[11px] text-red-500 font-medium" />
              </FormItem>
            )}
          />

          {/* Administrator Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Admin Email Address
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="email"
                      placeholder="admin@banglabazar.com"
                      autoComplete="email"
                      disabled={isLoading}
                      {...field}
                      className="h-11 pl-10 pr-3 rounded-xl border-slate-200 dark:border-slate-800 focus-visible:ring-blue-600 text-sm bg-slate-50/50 dark:bg-slate-900/50"
                    />
                  </div>
                </FormControl>
                <FormDescription className="text-[11px] text-slate-400">
                  This will be the master login identifier for the store admin portal.
                </FormDescription>
                <FormMessage className="text-[11px] text-red-500 font-medium" />
              </FormItem>
            )}
          />

          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Admin Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      autoComplete="new-password"
                      disabled={isLoading}
                      {...field}
                      className="h-11 pl-10 pr-10 rounded-xl border-slate-200 dark:border-slate-800 focus-visible:ring-blue-600 text-sm bg-slate-50/50 dark:bg-slate-900/50"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none"
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

                {/* Password Requirements Checklist */}
                <div className="pt-2 pb-1 space-y-1.5">
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Password must contain:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                    <div
                      className={`flex items-center gap-1.5 transition-colors duration-150 ${hasMinLength
                          ? "text-emerald-600 dark:text-emerald-400 font-medium"
                          : "text-slate-400 dark:text-slate-500"
                        }`}
                    >
                      {hasMinLength ? (
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 shrink-0 opacity-40" />
                      )}
                      <span>At least 8 characters</span>
                    </div>

                    <div
                      className={`flex items-center gap-1.5 transition-colors duration-150 ${hasUppercase
                          ? "text-emerald-600 dark:text-emerald-400 font-medium"
                          : "text-slate-400 dark:text-slate-500"
                        }`}
                    >
                      {hasUppercase ? (
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 shrink-0 opacity-40" />
                      )}
                      <span>Uppercase letter (A-Z)</span>
                    </div>

                    <div
                      className={`flex items-center gap-1.5 transition-colors duration-150 ${hasLowercase
                          ? "text-emerald-600 dark:text-emerald-400 font-medium"
                          : "text-slate-400 dark:text-slate-500"
                        }`}
                    >
                      {hasLowercase ? (
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 shrink-0 opacity-40" />
                      )}
                      <span>Lowercase letter (a-z)</span>
                    </div>

                    <div
                      className={`flex items-center gap-1.5 transition-colors duration-150 ${hasNumber
                          ? "text-emerald-600 dark:text-emerald-400 font-medium"
                          : "text-slate-400 dark:text-slate-500"
                        }`}
                    >
                      {hasNumber ? (
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 shrink-0 opacity-40" />
                      )}
                      <span>At least 1 number (0-9)</span>
                    </div>
                  </div>
                </div>

                <FormMessage className="text-[11px] text-red-500 font-medium" />
              </FormItem>
            )}
          />

          {/* Confirm Password */}
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Confirm Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Repeat password"
                      autoComplete="new-password"
                      disabled={isLoading}
                      {...field}
                      className="h-11 pl-10 pr-10 rounded-xl border-slate-200 dark:border-slate-800 focus-visible:ring-blue-600 text-sm bg-slate-50/50 dark:bg-slate-900/50"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none"
                      aria-label={
                        showConfirmPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showConfirmPassword ? (
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

          {/* Secure One-Time Setup Token */}
          <FormField
            control={form.control}
            name="setupToken"
            render={({ field }) => (
              <FormItem className="pt-1">
                <FormLabel className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>One-Time Setup Token</span>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-normal">
                    Server Secret
                  </span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-500" />
                    <Input
                      type={showToken ? "text" : "password"}
                      placeholder="Enter ADMIN_SETUP_TOKEN from environment"
                      autoComplete="off"
                      disabled={isLoading}
                      {...field}
                      className="h-11 pl-10 pr-10 rounded-xl border-amber-200/80 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/20 focus-visible:ring-amber-500 text-sm font-mono"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowToken((prev) => !prev)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none"
                      aria-label={showToken ? "Hide token" : "Show token"}
                    >
                      {showToken ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormDescription className="text-[11px] text-slate-400 leading-relaxed">
                  Enter the secret token configured in your server environment (<code>ADMIN_SETUP_TOKEN</code>).
                </FormDescription>
                <FormMessage className="text-[11px] text-red-500 font-medium" />
              </FormItem>
            )}
          />

          {/* Submit CTA */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all duration-200 mt-4 cursor-pointer flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Initializing Admin Account...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                <span>Create Master Administrator</span>
                <Sparkles className="h-3.5 w-3.5 text-blue-200" />
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
