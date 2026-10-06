"use client";
import PageTitle from "@/components/ui/PageTitle";
import { Button } from "@/components/ui/button";
import prisma from "@/index";
import { ArrowLeft, DownloadCloud } from "lucide-react";
import Link from "next/link";
import { UserDataTable } from "./data-table";
import { columns } from "./columns";

function CategoryWiseSaleComponent({ data }) {
  const currentSaleId = window.location.pathname;
  const routeParts = currentSaleId.split("/");
  const id = routeParts[routeParts.length - 1];

  //   let filteredProducts = [];

  // // Iterate through each sale object
  // data.forEach(sale => {
  //     // Filter soldProducts based on categoryId
  //     const filtered = data?.soldProducts?.filter(product => product.categoryId === id);
  //      ("filtered: ", filtered);
  //     // Add filtered products to the new array
  //     filteredProducts.push({
  //         saleId: sale.id,
  //         filteredProducts: filtered
  //     });
  // });

  //  ("filteredProducts", filteredProducts);

  const transformedData = data.flatMap((sale: any) => {
    return sale.soldProducts.map((product: any) => ({
      id: product?.id,
      name: product?.name,
      articleCode: product?.articleCode,
      categoryId: product?.categoryId,
      mrp: product?.mrp,
      tp: product?.tp,
      hsCode: product?.hsCode,
      openingQty: product?.openingQty,
      cogs: product?.cogs,
      closingQty: product?.closingQty,
      order: product?.order,
      price: product?.price || 0,
      qty: product?.qty,
      discount: product?.discount,
      total: product?.total,
    }));
  });
  const filteredData = transformedData?.filter((item: any) => {
    return item.categoryId === id;
  });

  "product", filteredData;
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center">
          <Link href="/dashboard/sales">
            <Button variant="ghost">
              <ArrowLeft />
            </Button>
          </Link>
          {/* TODO:: Category Name Should be Dynamic */}
          <PageTitle title="Category Wise Article Sales" />
        </div>
        <div className="flex items-center space-x-2">
          {/* <Link href="/dashboard/sales/category-sales">
                <Button className="bg-white text-black hover:text-white">
                  Category Sale
                </Button>
              </Link> */}
          <Button>
            <DownloadCloud className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
        {/* @ts-ignore */}
        <UserDataTable columns={columns} data={filteredData} />
      </div>
    </div>
  );
}

export default CategoryWiseSaleComponent;
