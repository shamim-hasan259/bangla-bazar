import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;
    const userRole = String(token?.role || token?.type || "").toLowerCase();

    // 1. Admin routes protection (/admin/dashboard, /admin/* except /admin/login & /admin/setup, /dashboard/admin/*)
    const isAdminProtectedPath =
      (pathname.startsWith("/admin") &&
        pathname !== "/admin/login" &&
        pathname !== "/admin/setup") ||
      pathname.startsWith("/dashboard/admin");

    if (isAdminProtectedPath) {
      if (!token) {
        const url = req.nextUrl.clone();
        url.pathname = "/admin/login";
        return NextResponse.redirect(url);
      }

      if (userRole !== "admin") {
        // Prevent Customers and Sellers from accessing Admin routes
        const url = req.nextUrl.clone();
        url.pathname = "/admin/login";
        return NextResponse.redirect(url);
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const { pathname } = req.nextUrl;
        // Public admin login and one-time setup pages
        if (pathname === "/admin/login" || pathname === "/admin/setup") {
          return true;
        }
        // Protected paths require a valid token
        if (
          pathname.startsWith("/admin") ||
          pathname.startsWith("/dashboard") ||
          pathname.startsWith("/congratulation")
        ) {
          return !!token;
        }
        return true;
      },
    },
    pages: {
      signIn: "/auth/customer/login",
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/congratulation/:path*",
  ],
};
