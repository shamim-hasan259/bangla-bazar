export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import MavenNavbar from "@/components/common/MavenNavbar";
import Footer from "@/components/common/Footer";

export const metadata: Metadata = {
  title: "Bangla Bazar",
  description: "Import Management System",
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <MavenNavbar />
      {children}
      <Footer />
    </>
  );
}
