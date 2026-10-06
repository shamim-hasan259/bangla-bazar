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
import { toast } from "sonner";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LoginFormSchema } from "@/lib/LoginFormSchema";
import PageTitle from "@/components/ui/PageTitle";
import PasswordShowClose from "@/app/dashboard/seller/setting/_components/PasswordShowClose";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import GoogleLoginButton from "@/components/auth/GoogleLoginButton";
import FacebookLoginButton from "@/components/auth/FacebookLoginButton";

type LoginFormProps = {
  role: string;
  credential: string;
  isSidePanel?: boolean;
};
const LoginForm: React.FC<LoginFormProps> = ({ role, credential, isSidePanel = false }) => {
  const [eyeOpen, setEyeOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const form = useForm<z.infer<typeof LoginFormSchema>>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      phone: "",
      password: "",
    },
  });

  async function onSubmit(data: z.infer<typeof LoginFormSchema>) {
    try {
      setIsLoading(true);
      // Next Auth for Login
      const res = await signIn(credential, {
        phone: data.phone,
        email: data.phone,
        password: data.password,
        redirect: false,
      });

      if (res?.error) {
        toast.error("Invalid credentials", {
          description: "Please check your login details and password.",
        });
      } else {
        toast.success("Login successful!");
        window.location.href = `/dashboard/${role}`;
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong", {
        description: "Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const innerForm = (
    <div className={isSidePanel ? "w-full space-y-3" : "max-w-md w-full space-y-3 border p-6 rounded-md shadow-lg"}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-4"
        >
          <PageTitle
            title={role === "affiliate" ? "Affiliate Partner Login" : role === "admin" ? "Admin Portal Login" : "Login Your Account"}
            className={isSidePanel ? "pb-2 text-center text-slate-800 dark:text-white font-extrabold" : "pb-4 text-center"}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem className={isSidePanel ? "space-y-1" : ""}>
                <FormLabel className={isSidePanel ? "text-xs font-bold text-slate-650 dark:text-slate-300" : ""}>
                  {role === "seller" || role === "affiliate" || role === "admin" ? "Email or Phone Number" : "Phone Number"}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={role === "seller" || role === "affiliate" || role === "admin" ? "Enter your email or phone number" : "Enter your phone number"}
                    {...field}
                    className={isSidePanel ? "h-10 rounded-lg text-xs text-black font-medium dark:text-white bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700" : "text-black font-medium dark:text-white"}
                  />
                </FormControl>
                <FormMessage className={isSidePanel ? "text-[10px]" : ""} />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className={isSidePanel ? "space-y-1" : ""}>
                <FormLabel className={isSidePanel ? "text-xs font-bold text-slate-650 dark:text-slate-300" : ""}>
                  Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={`${eyeOpen ? "text" : "password"}`}
                      placeholder="Enter your password"
                      {...field}
                      className={isSidePanel ? "h-10 rounded-lg text-xs text-black font-medium dark:text-white bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 pr-10" : "text-black font-medium dark:text-white pr-10"}
                    />
                    <PasswordShowClose
                      eyeOpen={eyeOpen}
                      setEyeOpen={setEyeOpen}
                    />
                  </div>
                </FormControl>
                <FormMessage className={isSidePanel ? "text-[10px]" : ""} />
              </FormItem>
            )}
          />
          {isSidePanel && <div className="h-2" />}
          <Button
            className={isSidePanel ? "w-full bg-[#1E60ED] hover:bg-blue-600 text-white font-extrabold h-11 rounded-lg text-xs shadow-md transition-colors" : "w-full"}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </Button>
        </form>
      </Form>
      {role !== "admin" && (
        <div className="space-y-2 pt-2">
          <GoogleLoginButton role={role} callbackUrl={role === "affiliate" ? "/dashboard/affiliate" : role === "seller" ? "/dashboard/seller" : "/dashboard/customer"} />
          <FacebookLoginButton role={role} callbackUrl={role === "affiliate" ? "/dashboard/affiliate" : role === "seller" ? "/dashboard/seller" : "/dashboard/customer"} />
        </div>
      )}
      <p className="flex items-center mt-4 justify-center text-xs text-slate-400 font-medium select-none">
        Don't have an account?{" "}
        <Link href={`/auth/${role}/registration`}>
          <Button
            variant="link"
            className={isSidePanel ? "px-1.5 text-xs font-bold text-[#1E60ED] hover:underline cursor-pointer" : "px-2 text-md font-semibold"}
          >
            Register
          </Button>
        </Link>{" "}
      </p>
    </div>
  );

  if (isSidePanel) {
    return innerForm;
  }

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      {innerForm}
    </div>
  );
};

export default LoginForm;
