import React from "react";
import ArticleSaleMain from "./ArticleSale";
export default async function ArticleSale() {
  return (
    <main className="flex min-h-screen flex-col gap-6 w-full">
      <div className=" flex-col flex w-full">
        <ArticleSaleMain />
      </div>
    </main>
  );
}
