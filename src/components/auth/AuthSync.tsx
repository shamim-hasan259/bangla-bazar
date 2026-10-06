"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { login } from "@/app/redux-store/Slice/AuthSlice";

export default function AuthSync() {
    const { data: session } = useSession();
    const dispatch = useDispatch();
    const [isMounted, setIsMounted] = useState(false);

    // Ensure this only runs on the client side after hydration
    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isMounted && session?.user) {
            dispatch(
                login({
                    user: session.user as any,
                    token: "google-session-token", // NextAuth manages the token, but we need a placeholder for the slice
                })
            );
        }
    }, [session, dispatch, isMounted]);

    // Don't render anything during SSR
    if (!isMounted) {
        return null;
    }

    return null;
}
