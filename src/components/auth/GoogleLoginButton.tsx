"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";

interface GoogleLoginButtonProps {
    role?: string;
    callbackUrl?: string;
}

export default function GoogleLoginButton({ role, callbackUrl }: GoogleLoginButtonProps) {
    const targetUrl = callbackUrl || (role ? `/dashboard/${role}` : "/dashboard");

    return (
        <Button
            type="button"
            variant="outline"
            className="w-full mt-4 flex items-center justify-center gap-2 cursor-pointer rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold"
            onClick={() => signIn("google", { callbackUrl: targetUrl })}
        >
            <FcGoogle className="h-4 w-4" />
            Sign in with Google
        </Button>
    );
}