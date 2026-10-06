import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "@/providers/AuthProvider";
import StoreProvider from "../providers/StoreProvider";
import ThemeProvider from "@/providers/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { LanguageProvider } from "@/context/LanguageContext";
import SmoothScrollProvider from "@/providers/SmoothScrollProvider";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "https://banglabazar.com.bd";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Bangla Bazar | Bangladesh's Leading Multi-Vendor Online Marketplace",
    template: "%s | Bangla Bazar",
  },
  description:
    "Bangla Bazar is Bangladesh's premier multi-vendor online marketplace. Shop authentic electronics, trendy fashion, groceries, health & beauty, and home essentials with verified sellers, fast nationwide delivery, and cash on delivery.",
  keywords: [
    "Bangla Bazar",
    "Multi-Vendor Marketplace Bangladesh",
    "Online Shopping Bangladesh",
    "E-commerce BD",
    "Buy Online Bangladesh",
    "Sell Online BD",
    "Daraz Alternative Bangladesh",
    "Authentic Products BD",
    "Best Price Shopping BD",
    "Electronics Bangladesh",
    "Fashion & Lifestyle BD",
    "Cash on Delivery Bangladesh",
    "Flash Sales BD",
    "Verified Sellers BD",
    "Wholesale Marketplace Bangladesh",
  ],
  authors: [{ name: "Bangla Bazar", url: siteUrl }],
  creator: "Bangla Bazar",
  publisher: "Bangla Bazar Ltd.",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Bangla Bazar | Multi-Vendor Online Shopping Platform in Bangladesh",
    description:
      "Shop thousands of authentic products from verified sellers across Bangladesh. Enjoy daily flash sales, best deals, secure payment & fast cash on delivery.",
    url: siteUrl,
    siteName: "Bangla Bazar",
    images: [
      {
        url: "/img/og-banner.jpg",
        width: 1200,
        height: 630,
        alt: "Bangla Bazar Multi-Vendor Online Marketplace",
      },
    ],
    locale: "bn_BD",
    alternateLocale: ["en_US"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bangla Bazar | Multi-Vendor Online Marketplace",
    description:
      "Shop from verified sellers across Bangladesh with fast delivery & best price guarantees.",
    images: ["/img/og-banner.jpg"],
    creator: "@banglabazar",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  category: "ecommerce",
  classification: "Multi-Vendor E-Commerce Marketplace",
  other: {
    "geo.region": "BD",
    "geo.placename": "Dhaka, Bangladesh",
    "target": "all",
    "rating": "General",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        "url": siteUrl,
        "name": "Bangla Bazar",
        "description": "Multi-Vendor Online Marketplace in Bangladesh",
        "publisher": {
          "@id": `${siteUrl}/#organization`,
        },
        "potentialAction": [
          {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": `${siteUrl}/products?search={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
          },
        ],
        "inLanguage": ["bn-BD", "en-US"],
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        "name": "Bangla Bazar",
        "url": siteUrl,
        "logo": {
          "@type": "ImageObject",
          "url": `${siteUrl}/logo.png`,
          "caption": "Bangla Bazar Logo",
        },
        "sameAs": [
          "https://facebook.com/banglabazar",
          "https://instagram.com/banglabazar",
          "https://twitter.com/banglabazar",
        ],
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+8801700000000",
          "contactType": "customer service",
          "areaServed": "BD",
          "availableLanguage": ["Bangla", "English"],
        },
      },
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className="font-sans" suppressHydrationWarning>
        <StoreProvider>
          <SessionProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem={false}
              forcedTheme="light"
              disableTransitionOnChange={true}
            >
              <LanguageProvider>
                <SmoothScrollProvider>
                  {children}
                  <Toaster />
                </SmoothScrollProvider>
              </LanguageProvider>
            </ThemeProvider>
          </SessionProvider>
        </StoreProvider>
      </body>
    </html>
  );
}