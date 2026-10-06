import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import bcrypt from "bcrypt";
import { connectToDatabase, generateCustomerId } from "../../helpers/server-helpers";
import prisma from "@/index";
import sendMessage from "@/lib/smsSystem";
import sendEmail from "@/lib/emailSystem";

const Credentials = (CredentialsProvider as any)?.default || CredentialsProvider;
const Google = (GoogleProvider as any)?.default || GoogleProvider;
const Facebook = (FacebookProvider as any)?.default || FacebookProvider;

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || "default-bangla-bazar-secret-key-12345",
  session: {
    strategy: "jwt",
  },

  providers: [
    Credentials({
      name: "customerCredentials",
      id: "customerCredentials",
      credentials: {
        phone: {
          label: "Phone or Email",
          type: "text",
          placeholder: "Enter your phone or email",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: Record<string, any> | undefined) {
        if (!credentials || !credentials.phone || !credentials.password)
          return null;
        try {
          await connectToDatabase();
          const customer = await prisma.customer.findFirst({
            where: {
              OR: [
                { phone: credentials.phone },
                { email: credentials.phone },
              ],
            },
          });

          if (!customer || !customer.password) return null;

          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            customer.password
          );
          if (isPasswordCorrect) {
            return {
              id: customer.id,
              name: customer.name,
              email: customer.email,
              phone: customer.phone,
              photo: customer.photo,
              customerId: customer.customerId,
              type: "customer",
            };
          }
          return null;
        } catch (error) {
          console.error("Customer authorize error:", error);
          return null;
        } finally {
          await prisma.$disconnect();
        }
      },
    }),

    Credentials({
      name: "sellerCredentials",
      id: "sellerCredentials",
      credentials: {
        phone: {
          label: "Phone or Email",
          type: "text",
          placeholder: "Enter your phone or email",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: Record<string, any> | undefined) {
        if (!credentials || !credentials.phone || !credentials.password)
          return null;
        try {
          await connectToDatabase();
          const seller = await prisma.seller.findFirst({
            where: {
              OR: [
                { phone: credentials.phone },
                { email: credentials.phone },
              ],
            },
          });

          if (!seller) return null;

          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            seller.password
          );
          if (isPasswordCorrect) {
            return seller;
          }
          return null;
        } catch (error) {
          console.error("Seller authorize error:", error);
          return null;
        } finally {
          await prisma.$disconnect();
        }
      },
    }),

    Credentials({
      name: "adminCredentials",
      id: "adminCredentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@example.com" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials: Record<string, any> | undefined) {
        const email = (credentials?.email || credentials?.phone || "").trim().toLowerCase();
        if (!email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const rawPassword = credentials.password;

        // Rate limiting check
        const { checkAdminLoginRateLimit, recordAdminFailedAttempt, resetAdminRateLimit } = await import("@/lib/adminAuth");
        const rateLimit = checkAdminLoginRateLimit(email);
        if (!rateLimit.isAllowed) {
          throw new Error(`Too many login attempts. Please try again in ${rateLimit.retryAfterSeconds} seconds.`);
        }

        try {
          await connectToDatabase();

          // Authenticate strictly against the dedicated Admin collection
          const admin = await prisma.admin.findUnique({
            where: { email },
          });

          if (!admin || !admin.password) {
            recordAdminFailedAttempt(email);
            throw new Error("Invalid email or password");
          }

          // Reject inactive Admin accounts
          if (admin.status.toLowerCase() !== "active") {
            recordAdminFailedAttempt(email);
            throw new Error("Your Admin account is inactive.");
          }

          // Verify password securely with bcrypt
          const isPasswordCorrect = await bcrypt.compare(
            rawPassword,
            admin.password
          );

          if (!isPasswordCorrect) {
            recordAdminFailedAttempt(email);
            throw new Error("Invalid email or password");
          }

          // Reset rate limit counter on successful authorization
          resetAdminRateLimit(email);

          return {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            photo: (admin as any).photo || "",
            phone: (admin as any).phone || "",
            role: "admin",
            type: "admin",
          };
        } catch (error: any) {
          console.error("Admin authorize error:", error?.message || error);
          throw error;
        } finally {
          await prisma.$disconnect();
        }
      },
    }),
    Credentials({
      name: "affiliateCredentials",
      id: "affiliateCredentials",
      credentials: {
        phone: {
          label: "Phone or Email",
          type: "text",
          placeholder: "Enter your phone or email",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: Record<string, any> | undefined) {
        if (!credentials || !credentials.phone || !credentials.password)
          return null;
        try {
          await connectToDatabase();
          const identifier = String(credentials.phone).trim();
          const affiliate = await (prisma as any).affiliate.findFirst({
            where: {
              OR: [
                { phone: identifier },
                { email: identifier },
                { email: identifier.toLowerCase() },
              ],
            },
          });

          if (!affiliate || !affiliate.password) return null;

          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            affiliate.password
          );
          if (isPasswordCorrect) {
            return {
              id: affiliate.id,
              name: affiliate.name,
              email: affiliate.email,
              phone: affiliate.phone,
              photo: affiliate.photo,
              affiliateCode: affiliate.affiliateCode,
              type: "affiliate",
            };
          }
          return null;
        } catch (error) {
          console.error("Affiliate authorize error:", error);
          return null;
        } finally {
          await prisma.$disconnect();
        }
      },
    }),

    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "google-client-id-placeholder",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "google-client-secret-placeholder",
    }),
    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID || "facebook-client-id-placeholder",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "facebook-client-secret-placeholder",
    }),
  ],

  pages: {
    signIn: "/auth/customer/login",
  },

  callbacks: {
    session: ({ session, token }) => {
      const typeLower = String(token.type || "").toLowerCase();
      const photoUrl = (token as any).photo || (token as any).picture || (token as any).image || "";

      if (typeLower === "customer") {
        return {
          ...session,
          user: {
            ...session.user,
            id: token.id,
            customerId: token.customerId,
            type: "customer",
            phone: token.phone,
            photo: photoUrl,
            image: photoUrl,
            email: token.email,
            name: token.name,
          },
        };
      }
      if (typeLower === "seller") {
        return {
          ...session,
          user: {
            ...session.user,
            id: token.id,
            sellerId: token.sellerId,
            type: "seller",
            phone: token.phone,
            photo: photoUrl,
            image: photoUrl,
            email: token.email,
            name: token.name,
          },
        };
      }
      if (typeLower === "affiliate" || token.isAffiliate || token.affiliateCode) {
        return {
          ...session,
          user: {
            ...session.user,
            id: token.id,
            affiliateCode: token.affiliateCode,
            type: "affiliate",
            role: "affiliate",
            isAffiliate: true,
            phone: token.phone,
            photo: photoUrl,
            image: photoUrl,
            email: token.email,
            name: token.name,
          },
        };
      }
      if (typeLower === "admin") {
        return {
          ...session,
          user: {
            ...session.user,
            id: token.id,
            name: token.name,
            email: token.email,
            photo: photoUrl,
            image: photoUrl,
            phone: (token as any).phone || "",
            role: "admin",
            type: "admin",
          },
        };
      }
      if (["manager", "marketing", "sales", "stuff"].includes(typeLower)) {
        return {
          ...session,
          user: {
            ...session.user,
            id: token.id,
            username: token.username,
            type: token.type || "Admin",
            phone: token.phone,
            photo: photoUrl,
            image: photoUrl,
            warehouseId: token.warehouseId,
            email: token.email,
            name: token.name,
          },
        };
      }
      return session; // Default return
    },
    signIn: async ({ account, profile }) => {
      if (account?.provider === "google" || account?.provider === "facebook") {
        if (!profile?.email) return "/auth/customer/login?error=NoEmailProvided";
        try {
          await connectToDatabase();
          const email = profile.email.toLowerCase().trim();
          const name = profile.name || "Customer";
          const photo = account.provider === "facebook"
            ? ((profile as any).picture?.data?.url || (profile as any).image)
            : ((profile as any).picture || (profile as any).image);

          // 1. Check if user is an existing Affiliate
          const existingAffiliate = await (prisma as any).affiliate.findFirst({
            where: { email: email },
          });

          if (existingAffiliate) {
            if (photo && !existingAffiliate.photo) {
              await (prisma as any).affiliate.update({
                where: { id: existingAffiliate.id },
                data: { photo },
              });
            }
            return true;
          }

          // 2. Check if user is an existing Seller
          const existingSeller = await prisma.seller.findFirst({
            where: { email: email },
          });

          if (existingSeller) {
            return true;
          }

          // 3. Check / Create Customer
          const existingCustomer = await prisma.customer.findFirst({
            where: { email: email },
          });

          if (existingCustomer) {
            // Update existing customer info if changed
            await prisma.customer.update({
              where: { id: existingCustomer.id },
              data: {
                name: name,
                photo: photo,
              },
            });

            // Optionally notify of login
            await sendEmail({
              to: email,
              subject: "New Login Detected",
              message: `Hi ${name}, you successfully logged in to Bangla Bazar using ${account.provider}.`
            });

          } else {
            // Create new customer in Customer collection
            const uniqueCusId = await generateCustomerId();

            const passwordSource = email || (profile as any).phone || "123456";
            const hashedPassword = await bcrypt.hash(passwordSource, 10);
            const phoneStr = (profile as any).phone || `social_${uniqueCusId}`;

            await prisma.customer.create({
              data: {
                name: name,
                email: email,
                phone: phoneStr,
                password: hashedPassword,
                type: "customer",
                customerId: uniqueCusId,
                status: "Active",
                photo: photo,
              },
            });

            // Send Notifications for registration
            await sendEmail({
              to: email,
              subject: "Welcome to Bangla Bazar!",
              message: `Welcome ${name}! Your account has been created via ${account.provider}. Your password is: ${passwordSource}`
            });

            if ((profile as any).phone) {
              await sendMessage({
                to: (profile as any).phone,
                message: `Welcome to Bangla Bazar! Your account is ready. Login with ${account.provider} or Email: ${email}`
              });
            }
          }
          return true;
        } catch (error) {
          console.error(`${account.provider} social sign in error:`, error);
          return `/auth/customer/login?error=SocialLoginError&msg=${encodeURIComponent((error as Error).message)}`;
        } finally {
          await prisma.$disconnect();
        }
      }
      return true;
    },
    jwt: async ({ token, user, account, trigger, session: updateSessionData }) => {
      // 1. Handle dynamic client-side update() call
      if (trigger === "update" && updateSessionData) {
        const uData = (updateSessionData as any)?.user || updateSessionData;
        if (uData.photo !== undefined) token.photo = uData.photo;
        if (uData.image !== undefined) token.image = uData.image;
        if (uData.name !== undefined) token.name = uData.name;
        if (uData.email !== undefined) token.email = uData.email;
        if (uData.phone !== undefined) token.phone = uData.phone;
      }

      if (account?.provider === "google" || account?.provider === "facebook") {
        try {
          await connectToDatabase();
          const email = (token.email || "").toLowerCase().trim();

          // 1. Check Affiliate
          const affiliate = await (prisma as any).affiliate.findFirst({
            where: { email: email },
          });

          if (affiliate) {
            token.id = affiliate.id;
            token.affiliateCode = affiliate.affiliateCode;
            token.type = "affiliate";
            token.role = "affiliate";
            token.isAffiliate = true;
            token.phone = affiliate.phone || "";
            token.photo = affiliate.photo || token.picture || "";
            token.image = affiliate.photo || token.picture || "";
            token.name = affiliate.name || token.name;
            return token;
          }

          // 2. Check Seller
          const seller = await prisma.seller.findFirst({
            where: { email: email },
          });

          if (seller) {
            token.id = seller.id;
            token.sellerId = seller.sellerId;
            token.type = "seller";
            token.phone = seller.phone || "";
            token.photo = seller.photo || token.picture || "";
            token.image = seller.photo || token.picture || "";
            token.name = seller.name || token.name;
            return token;
          }

          // 3. Check Customer
          const customer = await prisma.customer.findFirst({
            where: { email: email },
          });

          if (customer) {
            token.id = customer.id;
            token.customerId = customer.customerId;
            token.type = customer.type || "customer";
            token.phone = customer.phone || "";
            token.photo = customer.photo || "";
            token.image = customer.photo || "";
          }
        } catch (error) {
          console.error(`jwt ${account?.provider} error`, error);
        }
      }
      if (user) {
        const u = user as {
          id: string;
          customerId?: string;
          sellerId?: string;
          username?: string;
          type?: string;
          phone?: string;
          photo?: string;
          image?: string;
          warehouseId?: string;
          email?: string;
          name?: string;
        };

        const typeLower = String(u.type || "").toLowerCase();
        const photoUrl = u.photo || u.image || "";

        if (typeLower === "customer") {
          return {
            ...token,
            id: u.id,
            customerId: u.customerId,
            type: "customer",
            phone: u.phone,
            photo: photoUrl,
            image: photoUrl,
            email: u.email,
            name: u.name,
          };
        } else if (typeLower === "seller") {
          return {
            ...token,
            id: u.id,
            sellerId: u.sellerId,
            type: "seller",
            phone: u.phone,
            photo: photoUrl,
            image: photoUrl,
            email: u.email,
            name: u.name,
          };
        } else if (typeLower === "affiliate") {
          return {
            ...token,
            id: u.id,
            affiliateCode: (u as any).affiliateCode,
            type: "affiliate",
            isAffiliate: true,
            phone: u.phone,
            photo: photoUrl,
            image: photoUrl,
            email: u.email,
            name: u.name,
          };
        } else if (typeLower === "admin") {
          return {
            ...token,
            id: u.id,
            name: u.name,
            email: u.email,
            photo: photoUrl,
            image: photoUrl,
            phone: (u as any).phone || "",
            role: "admin",
            type: "admin",
          };
        } else if (["manager", "marketing", "sales", "stuff"].includes(typeLower)) {
          return {
            ...token,
            id: u.id,
            username: u.username,
            type: u.type || "Admin",
            phone: u.phone,
            photo: photoUrl,
            image: photoUrl,
            warehouseId: u.warehouseId,
            email: u.email,
            name: u.name,
          };
        }
      }

      // 2. Ensure photo is always kept in sync from DB for active sessions
      if (token?.id && !user) {
        const typeLower = String(token.type || "").toLowerCase();
        try {
          if (typeLower === "admin") {
            const rawFind = (await prisma.$runCommandRaw({
              find: "Admin",
              filter: { _id: { $oid: token.id as string } },
              limit: 1,
            })) as any;
            const adminDoc = rawFind?.cursor?.firstBatch?.[0];
            if (adminDoc) {
              if (adminDoc.photo) {
                token.photo = adminDoc.photo;
                token.image = adminDoc.photo;
              }
              if (adminDoc.name) token.name = adminDoc.name;
            }
          } else if (typeLower === "seller") {
            const sellerDoc = await prisma.seller.findUnique({
              where: { id: token.id as string },
              select: { name: true, photo: true },
            });
            if (sellerDoc?.photo) {
              token.photo = sellerDoc.photo;
              token.image = sellerDoc.photo;
            }
          } else if (typeLower === "customer") {
            const custDoc = await prisma.customer.findUnique({
              where: { id: token.id as string },
              select: { name: true, photo: true },
            });
            if (custDoc?.photo) {
              token.photo = custDoc.photo;
              token.image = custDoc.photo;
            }
          }
        } catch (syncErr) {
          // Ignore sync errors gracefully
        }
      }

      return token; // Default return
    },
  },
};
