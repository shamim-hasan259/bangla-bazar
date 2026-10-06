"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { FaFacebook } from "react-icons/fa";

/**
 * FacebookLoginButton Component
 * 
 * This component allows users to login with their Facebook account.
 * It handles the OAuth flow using NextAuth.js.
 * 
 * Features:
 * - Displays a Facebook branded login button.
 * - Redirects to Facebook for authentication.
 * - Simple, SSR-safe implementation without session checks.
 */
interface FacebookLoginButtonProps {
    role?: string;
    callbackUrl?: string;
}

export default function FacebookLoginButton({ role, callbackUrl }: FacebookLoginButtonProps) {
    const targetUrl = callbackUrl || (role ? `/dashboard/${role}` : "/dashboard");

    const handleLogin = () => {
        signIn("facebook", { callbackUrl: targetUrl });
    };

    return (
        <Button
            type="button"
            variant="outline"
            className="w-full mt-2 flex items-center justify-center gap-2 bg-[#1877F2] hover:bg-[#1864D9] text-white hover:text-white border-transparent cursor-pointer rounded-xl text-xs font-semibold"
            onClick={handleLogin}
        >
            <FaFacebook className="h-4 w-4" />
            Continue with Facebook
        </Button>
    );
}
