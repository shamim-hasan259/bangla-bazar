import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      customerId?: string | null;
      sellerId?: string | null;
      affiliateCode?: string | null;
      username?: string | null;
      role?: string | null;
      type?: string | null;
      phone?: string | null;
      photo?: string | null;
      warehouseId?: string | null;
      isSeller?: boolean;
      isAffiliate?: boolean;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id?: string;
    customerId?: string | null;
    sellerId?: string | null;
    affiliateCode?: string | null;
    username?: string | null;
    role?: string | null;
    type?: string | null;
    phone?: string | null;
    photo?: string | null;
    warehouseId?: string | null;
    isSeller?: boolean;
    isAffiliate?: boolean;
    [key: string]: any;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    customerId?: string | null;
    sellerId?: string | null;
    affiliateCode?: string | null;
    username?: string | null;
    role?: string | null;
    type?: string | null;
    phone?: string | null;
    photo?: string | null;
    warehouseId?: string | null;
    isSeller?: boolean;
    isAffiliate?: boolean;
  }
}

