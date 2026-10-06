import PageTitle from "@/components/ui/PageTitle";
import { ProductDataTable } from "./data-table";
import { columns } from "./columns";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Archive,
  BadgeCheck,
  BoxIcon,
  Boxes,
  PencilRuler,
  UploadCloud,
} from "lucide-react";
import prisma from "@/index";

export default async function ProductsPage() {
  const data: any = await prisma.product.findMany({
    select: {
      id: true,
      photo: true,
      articleCode: true,
      name: true,
      closingQty: true,
      price: true,
      tp: true,
      mrp: true,
      status: true,
      ean: true,
      createdAt: true,
    },
  });

  return (
    <main className="flex min-h-screen flex-col gap-6 w-full">
      <div className=" flex-col flex w-full">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <PageTitle title="Products" />
            <div className="flex items-center space-x-2">
              <Menubar>
                <MenubarMenu>
                  <MenubarTrigger>
                    <BoxIcon className="mr-2 h-3 w-3" />
                    <Link href="/dashboard/admin/category"> Category </Link>
                  </MenubarTrigger>
                </MenubarMenu>
                <MenubarMenu>
                  <MenubarTrigger>
                    <BadgeCheck className="mr-2 h-3 w-3" />{" "}
                    <Link href="/dashboard/admin/brand">Brand</Link>
                  </MenubarTrigger>
                </MenubarMenu>
                <MenubarMenu>
                  <MenubarTrigger>
                    <PencilRuler className="mr-2 h-3 w-3" />{" "}
                    <Link href="/dashboard/admin/unit">Units</Link>
                  </MenubarTrigger>
                </MenubarMenu>
              </Menubar>
              {/* <Link href="/dashboard/admin/products/import">
                <Button>
                  <UploadCloud className="mr-2 h-4 w-4" /> Import
                </Button>
              </Link> */}
              <Link href="/dashboard/admin/products/create">
                <Button>
                  <Archive className="mr-2 h-4 w-4" /> Create New
                </Button>
              </Link>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
            <ProductDataTable columns={columns} data={data} />
          </div>
        </div>
      </div>
    </main>
  );
}
