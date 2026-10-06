import React from "react";
import FlashSaleCreateForm from "../_components/FlashSaleCreateForm";

export const dynamic = "force-dynamic";

export default async function AdminFlashSaleCreatePage() {
  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-300">
      <FlashSaleCreateForm />
    </div>
  );
}
