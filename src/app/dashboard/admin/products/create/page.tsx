"use client";
import PageTitle from "@/components/ui/PageTitle";
import { Button } from "@/components/ui/button";
import { ArrowLeft, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import ProductForm from "./ProductForm";

export default function CreateProductsPage() {
  const [product, setProduct] = useState<any>([]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/dashboard/admin/products">
            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <PageTitle title="Create New Product" />
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/dashboard/admin/products">
            <Button variant="outline" className="rounded-xl">
              <X className="w-4 h-4 mr-1.5" /> Cancel
            </Button>
          </Link>
        </div>
      </div>
      <ProductForm entry={product} />
    </div>
  );
}
