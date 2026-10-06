import PageTitle from "@/components/ui/PageTitle";
import { InventoryDataTable } from "./data-table";
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
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeftRight, GitCompareArrows, Trash } from "lucide-react";
import { resetAllProductData, saleInvetoryIn } from "./_action";
import prisma from "@/index";

export default async function ProductsPage() {
  const data: any = await prisma.product.findMany({});
  // await resetAllProductData();

  return (
    <main className="flex min-h-screen flex-col gap-6 w-full">
      <div className=" flex-col flex w-full">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <PageTitle title="Inventory" />
            <div className="flex items-center space-x-2">
              <Menubar>
                <MenubarMenu>
                  <MenubarTrigger>
                    <Trash className="mr-2 h-3 w-3" />
                    <Link href="/dashboard/admin/damage"> Damage </Link>
                  </MenubarTrigger>
                </MenubarMenu>
                <MenubarMenu>
                  <MenubarTrigger>
                    <GitCompareArrows className="mr-2 h-3 w-3" />{" "}
                    <Link href="/dashboard/admin/adjust">Adjustment</Link>
                  </MenubarTrigger>
                </MenubarMenu>
              </Menubar>
              <Link href="/dashboard/admin/movement">
                <Button>
                  <ArrowLeftRight className="mr-2 h-4 w-4" /> Product Movement
                </Button>
              </Link>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
            <InventoryDataTable columns={columns} data={data} />
          </div>
        </div>
      </div>
    </main>
  );
}
