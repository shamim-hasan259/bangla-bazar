import { notFound, redirect } from "next/navigation";
import prisma from "@/index";

interface RedirectPageProps {
  params: Promise<{ slug: string }>;
}

export default async function SlugRedirectPage({ params }: RedirectPageProps) {
  const { slug } = await params;

  // Check if this slug is a store
  const store = await prisma.store.findUnique({
    where: { slug }
  });

  if (store) {
    redirect(`/store/${slug}`);
  }

  // Fallback to standard 404 if no matching store slug exists
  notFound();
}
